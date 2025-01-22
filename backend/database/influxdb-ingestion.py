
import pandas as pd
from influxdb_client import InfluxDBClient, Point
from influxdb_client.client.write_api import SYNCHRONOUS
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class FeaturesDataIngester:
    def __init__(self):
        """
        Initialize InfluxDB client for features dataset ingestion
        """
        self.client = InfluxDBClient(
            url=os.getenv("INFLUXDB_URL"),
            token=os.getenv("INFLUXDB_TOKEN"),
            org=os.getenv("INFLUXDB_ORG")
        )
        self.write_api = self.client.write_api(write_options=SYNCHRONOUS)
        self.bucket = os.getenv("INFLUXDB_BUCKET", "network_features")

    def preprocess_features(self, features_path):
        """
        Preprocess features dataset before ingestion
        
        Args:
            features_path (str): Path to features CSV file
        
        Returns:
            pd.DataFrame: Preprocessed features dataframe
        """
        try:
            # Read the features CSV
            df = pd.read_csv(features_path)

            # Check for required columns
            if df.empty:
                raise ValueError("The features dataset is empty.")
            
            # Ensure all columns are strings to avoid type issues
            df.columns = df.columns.astype(str)

            return df

        except Exception as e:
            print(f"Error preprocessing features: {e}")
            raise

    def ingest_features(self, features_path):
        """
        Ingest features dataset into InfluxDB
        
        Args:
            features_path (str): Path to features CSV file
        """
        # Preprocess the features dataset
        features_df = self.preprocess_features(features_path)
        
        # Prepare points for InfluxDB ingestion
        points = []
        
        for index, row in features_df.iterrows():
            # Create a point for each feature row
            point = Point("network_features")
            
            # Add fields dynamically (excluding timestamp)
            for column in row.index:
                if pd.api.types.is_numeric_dtype(row[column]):
                    point.field(column, float(row[column]))  # Convert to float for numeric fields
                else:
                    point.field(column, str(row[column]))  # Convert to string for non-numeric fields
            
            points.append(point)

        # Write points to InfluxDB
        try:
            self.write_api.write(bucket=self.bucket, record=points)
            print(f"Successfully ingested {len(points)} feature points into InfluxDB")
        except Exception as e:
            print(f"Error ingesting features: {e}")
            raise

    def close(self):
        """Close InfluxDB client connection"""
        self.client.close()

def main():
    # Initialize ingester
    ingester = FeaturesDataIngester()
    
    try:
        # Ingest features dataset
        features_file_path = "path/to/your/features_dataset.csv"  # Update this path
        ingester.ingest_features(features_file_path)
        
    except Exception as e:
        print(f"Error during features ingestion: {e}")
    
    finally:
        # Always close the client connection
        ingester.close()

if __name__ == "__main__":
    main()

