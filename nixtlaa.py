import pandas as pd  
import numpy as np  
import matplotlib.pyplot as plt  
from nixtla import NixtlaClient  

class NetworkAnomalyDetector:  
    def __init__(self, api_key=None):  
        """  
        Initialize Nixtla Client for Network Anomaly Detection  
        
        Args:  
            api_key (str, optional): Nixtla API key  
        """  
        self.nixtla_client = NixtlaClient(api_key=api_key)  
        self.original_df = None  
        self.processed_df = None  
        self.anomalies_df = None  
    
    def load_dataset(self, file_path):  
        """  
        Load network dataset  
        
        Args:  
            file_path (str): Path to the CSV file  
        """  
        # Load with low memory to handle large files  
        self.original_df = pd.read_csv(file_path, low_memory=False)  
        print("Dataset loaded. Shape:", self.original_df.shape)  
        print("\nColumns:", list(self.original_df.columns))  
        return self.original_df  
    
    def preprocess_data(self, timestamp_col='Stime', value_col='Dload', freq='1min'):
        """  
        Preprocess network data for anomaly detection  
        """
        # Create a new DataFrame with just the columns we need
        self.processed_df = self.original_df[[timestamp_col, value_col]].copy()
        
        # Convert Unix timestamp to datetime and name it 'ds'
        self.processed_df['ds'] = pd.to_datetime(self.processed_df[timestamp_col], unit='s')
        
        # Drop the original timestamp column
        self.processed_df = self.processed_df.drop(columns=[timestamp_col])
        
        # Round timestamps to specified frequency intervals
        self.processed_df['ds'] = self.processed_df['ds'].dt.floor(freq)
        
        # Group and aggregate data
        self.processed_df = (self.processed_df.groupby('ds')[value_col]
                            .mean()
                            .reset_index())
        
        # Rename value column to 'y'
        self.processed_df.rename(columns={value_col: 'y'}, inplace=True)
        
        # Create a complete date range
        date_range = pd.date_range(
            start=self.processed_df['ds'].min(),
            end=self.processed_df['ds'].max(),
            freq=freq,
            name='ds'  # Important: name the index 'ds'
        )
        
        # Reindex while preserving the 'ds' column name
        self.processed_df = (self.processed_df.set_index('ds')
                            .reindex(date_range)
                            .reset_index())
        self.processed_df['ds'] = self.processed_df['ds'].to_numpy()
        
        # Ensure no missing values
        self.processed_df['y'] = self.processed_df['y'].interpolate(method='linear')
        
        print("\nProcessed DataFrame:")
        print(self.processed_df.head())
        print("\nTime Range:")
        print(f"Start: {self.processed_df['ds'].min()}")
        print(f"End: {self.processed_df['ds'].max()}")
        print(f"Total points: {len(self.processed_df)}")
        print(f"Missing values: {self.processed_df['y'].isna().sum()}")
        
        return self.processed_df
    
    def detect_anomalies(self, level=85, plot=True):  
        """  
        Detect anomalies in the network data  
        """  
        if self.processed_df is None:  
            raise ValueError("Please preprocess data first using preprocess_data()")  
        
        # Remove any remaining NaN values  
        self.processed_df = self.processed_df.dropna()  
        
        try:
            # Detect anomalies using Nixtla
            anomalies_result = self.nixtla_client.detect_anomalies(  
                self.processed_df,   
                freq='1min',
                level=level,  
                date_features=['hour', 'day'],  
                date_features_to_one_hot=True  
            )
            
            # Create a full DataFrame with all points and anomaly markers
            self.anomalies_df = self.processed_df.copy()
            self.anomalies_df['anomaly'] = False
            
            # Mark points as anomalies based on Nixtla results
            anomaly_timestamps = anomalies_result[anomalies_result['anomaly']]['ds'].to_numpy()
            self.anomalies_df['anomaly'] = self.anomalies_df['ds'].apply(lambda x: x in anomaly_timestamps)
            
            # Debug prints
            print("\nAnomalies detection results:")
            print("Total points:", len(self.anomalies_df))
            print("Anomalies found:", len(self.anomalies_df[self.anomalies_df['anomaly']]))
            
            if plot:  
                self.plot_anomalies()  
            
            return self.anomalies_df
            
        except Exception as e:
            print(f"Error in detect_anomalies: {str(e)}")
            print("Current DataFrame state:")
            print(self.processed_df.info())
            raise
    
    def plot_anomalies(self):  
        """  
        Visualize anomalies in the network data with clear highlighting  
        """  
        if self.anomalies_df is None:  
            raise ValueError("Run detect_anomalies() first")  
        
        try:  
            # Create figure with specific size
            plt.figure(figsize=(20, 10))  
            
            # Plot all data points
            plt.plot(
                self.anomalies_df['ds'].to_numpy(), 
                self.anomalies_df['y'].to_numpy(), 
                label='Network Traffic', 
                color='blue', 
                alpha=0.7,
                linewidth=1
            )  
            
            # Get and plot anomalies
            anomalies = self.anomalies_df[self.anomalies_df['anomaly']]
            
            if not anomalies.empty:
                # Ensure that the 'ds' and 'y' values for anomalies are the same length
                anomaly_x = anomalies['ds'].to_numpy()
                anomaly_y = anomalies['y'].to_numpy()

                if len(anomaly_x) == len(anomaly_y):
                    # Plot anomalies with red markers
                    plt.scatter(
                        anomaly_x,   
                        anomaly_y,   
                        color='red',   
                        marker='o',   
                        s=150,   
                        label=f'Anomalies ({len(anomalies)} points)',   
                        zorder=5  
                    )
                    
                    # Print debug info
                    print(f"\nPlotting {len(anomalies)} anomalies")
                    print("Anomaly values range:", anomaly_y.min(), "to", anomaly_y.max())
                else:
                    print("Mismatch in sizes of anomaly x and y values.")
            
            # Calculate and plot confidence intervals
            mean = self.anomalies_df['y'].mean()
            std = self.anomalies_df['y'].std()
            
            plt.fill_between(
                self.anomalies_df['ds'],   
                mean - 2*std,  # Lower bound
                mean + 2*std,  # Upper bound
                color='gray',   
                alpha=0.2,   
                label='Normal Range (±2σ)'
            )
            
            # Add statistics text box
            stats_text = (
                f'Total Points: {len(self.anomalies_df)}\n'
                f'Anomalies: {len(anomalies)} ({(len(anomalies)/len(self.anomalies_df)*100):.2f}%)\n'
                f'Mean Traffic: {mean:.2f}\n'
                f'Std Dev: {std:.2f}'
            )
            
            plt.text(
                0.02, 0.98, stats_text,
                transform=plt.gca().transAxes,
                bbox=dict(facecolor='white', alpha=0.8, edgecolor='gray'),
                verticalalignment='top',
                fontsize=10
            )
            
            plt.title('Network Traffic Anomaly Detection', fontsize=16, pad=20)
            plt.xlabel('Timestamp', fontsize=12)
            plt.ylabel('Network Load', fontsize=12)
            plt.legend(loc='upper right', fontsize=10)
            plt.grid(True, alpha=0.3)
            plt.xticks(rotation=45)
            plt.tight_layout()
            
            # plt.show()
            
        except Exception as e:  
            print(f"Error in plotting anomalies: {e}")  
            raise

    def advanced_anomaly_analysis(self):  
        """  
        Perform advanced analysis on detected anomalies  
        """  
        if self.anomalies_df is None:  
            raise ValueError("Run detect_anomalies() first")  
        
        # Detailed anomaly analysis  
        anomalies = self.anomalies_df[self.anomalies_df['anomaly'] == True]  
        
        print("\nDetailed Anomaly Analysis:")  
        print(f"Total Anomalies: {len(anomalies)}")  
        
        # Analyze anomaly characteristics  
        print("\nAnomaly Statistics:")  
        print("Mean Anomaly Value:", anomalies['y'].mean())  
        print("Max Anomaly Value:", anomalies['y'].max())  
        print("Min Anomaly Value:", anomalies['y'].min())  
        
        # Hourly anomaly distribution  
        anomalies['hour'] = anomalies['ds'].dt.hour  
        hourly_anomalies = anomalies.groupby('hour').size()  

        # Return anomalies data for plotting in the backend
        return anomalies, hourly_anomalies 

    def export_anomalies(self, output_path='network_anomalies.csv'):  
        """  
        Export detected anomalies to a CSV file  
        
        Args:  
            output_path (str): Path to save anomalies CSV  
        """  
        if self.anomalies_df is not None:  
            # Export only true anomalies  
            true_anomalies = self.anomalies_df[self.anomalies_df['anomaly'] == True]  
            true_anomalies.to_csv(output_path, index=False)  
            print(f"Anomalies exported to {output_path}")  
            return true_anomalies  
        else:  
            print("No anomalies detected. Run detect_anomalies() first.")  
            return None  

def main():  
    # Initialize detector  
    detector = NetworkAnomalyDetector(  
        api_key='nixak-9pAwRMIuOd7msVweFMh7JCnQz9WFTIfdw4oP8JgMXt3sIAF8rfTBSrViziARg6d1IwYnbiOxmKkheXOw'  
    )  
    
    # Load network dataset from assets folder  
    detector.load_dataset('AnomalyX-dataset.csv')  
    
    # Preprocess data with 3min intervals  
    processed_data = detector.preprocess_data(  
        timestamp_col='Stime',   
        value_col='Dload',   
        freq='1min'  
    )  
    
    # Detect anomalies with lower confidence level  
    anomalies = detector.detect_anomalies(level=85)  
    
    # Print anomalies  
    print("\nDetected Anomalies:")  
    print(anomalies[anomalies['anomaly'] == True].head())  
    
    # Advanced anomaly analysis  
    detector.advanced_anomaly_analysis()  
    
    # Export anomalies  
    detector.export_anomalies()  

if __name__ == "__main__":  
    main()