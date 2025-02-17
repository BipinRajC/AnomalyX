from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from dotenv import load_dotenv
import pandas as pd
import os
import matplotlib.pyplot as plt
from nixtlaa import NetworkAnomalyDetector 

load_dotenv()  

api_key = os.getenv('NIXTLA_API_KEY')

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing (CORS) for front-end requests

@app.route('/load_dataset', methods=['POST'])
def load_dataset():
    """ Endpoint to load the dataset from a file """
    file = request.files.get('file')
    if file:
        # Save the uploaded file
        file_path = os.path.join('uploads', file.filename)
        file.save(file_path)

        # Initialize the anomaly detector
        detector = NetworkAnomalyDetector()
        df = detector.load_dataset(file_path)
        
        return jsonify({
            'message': 'Dataset loaded successfully',
            'shape': df.shape,
            'columns': list(df.columns)
        })
    else:
        return jsonify({'error': 'No file uploaded'}), 400

@app.route('/preprocess_data', methods=['POST'])
def preprocess_data():
    """ Endpoint to preprocess the data for anomaly detection """
    params = request.get_json()
    timestamp_col = params.get('timestamp_col', 'Stime')
    value_col = params.get('value_col', 'Dload')
    
    # Initialize the anomaly detector
    detector = NetworkAnomalyDetector()
    detector.load_dataset(params['file_path'])
    
    processed_df = detector.preprocess_data(timestamp_col, value_col)
    processed_data = processed_df.to_dict(orient='records')
    
    return jsonify({
        'message': 'Data processed successfully',
        # 'time_range': {
        #     'start': processed_df['ds'].min().strftime('%Y-%m-%d %H:%M:%S'),
        #     'end': processed_df['ds'].max().strftime('%Y-%m-%d %H:%M:%S'),
        #     'total_points': len(processed_df),
        #     'missing_values': processed_df['y'].isna().sum()
        # },
        # 'head': processed_df.head().to_dict(orient='records')
        # 'df': processed_data
    })

@app.route('/detect_anomalies', methods=['POST'])
def detect_anomalies():
    """ Endpoint to detect anomalies """
    params = request.get_json()
    level = params.get('level', 85)
    
    # Initialize the anomaly detector
    detector = NetworkAnomalyDetector()
    detector.load_dataset(params['file_path'])
    detector.preprocess_data()
    
    anomalies_df = detector.detect_anomalies(level=level, plot=False)
    
    # Return anomalies as JSON
    anomalies = anomalies_df[anomalies_df['anomaly'] == True]
    anomaly_data = anomalies[['ds', 'y', 'anomaly']].to_dict(orient='records')
    
    return jsonify({
        'message': 'Anomalies detected successfully',
        'anomalies_count': len(anomalies),
        'anomalies': anomaly_data
    })

@app.route('/plot_anomalies', methods=['POST'])
def plot_anomalies():
    """ Endpoint to plot anomalies """
    params = request.get_json()
    
    # Initialize the anomaly detector
    detector = NetworkAnomalyDetector()
    detector.load_dataset(params['file_path'])
    detector.preprocess_data()
    
    # Detect anomalies and plot them
    anomalies_df = detector.detect_anomalies(level=params.get('level', 85), plot=False)
    detector.plot_anomalies()

    # Ensure the directory exists
    plot_dir = '/tmp/plots'
    if not os.path.exists(plot_dir):
        os.makedirs(plot_dir)
    elif not os.access(plot_dir, os.W_OK):
        raise PermissionError(f"Cannot write to the directory: {plot_dir}")
        
    plot_path = os.path.join(plot_dir, 'anomalies_plot.png')
    print(plot_path)
    
    # Save the plot to a file
    plt.savefig(plot_path)

    # Return the plot image
    return send_file(plot_path, mimetype='image/png', as_attachment=True)

@app.route('/advanced_anomaly_analysis', methods=['POST'])
def advanced_anomaly_analysis():
    """ Endpoint to perform advanced anomaly analysis """
    params = request.get_json()

    # Initialize the anomaly detector
    detector = NetworkAnomalyDetector()
    detector.load_dataset(params['file_path'])
    detector.preprocess_data()

    # Detect anomalies first
    anomalies_df = detector.detect_anomalies(level=params.get('level', 85), plot=False)
    
    # Run advanced anomaly analysis
    try:
        anomalies, hourly_anomalies = detector.advanced_anomaly_analysis()
    except ValueError as e:
        return jsonify({"error": str(e)}), 400
    
    # Create plots directory
    plot_dir = '/tmp/plots'
    if not os.path.exists(plot_dir):
        os.makedirs(plot_dir)
    
    hourly_anomalies_plot_path = os.path.join(plot_dir, 'hourly_anomalies_plot.png')
    anomaly_intensity_plot_path = os.path.join(plot_dir, 'anomaly_intensity_plot.png')

    # Plot Hourly Anomalies
    plt.figure(figsize=(15, 6))
    hourly_anomalies.plot(kind='bar')
    plt.title('Anomalies by Hour of Day')
    plt.xlabel('Hour')
    plt.ylabel('Number of Anomalies')
    plt.tight_layout()
    plt.savefig(hourly_anomalies_plot_path)

    # Plot Anomaly Intensity Over Time
    plt.figure(figsize=(15, 6))
    plt.scatter(anomalies['ds'], anomalies['y'], c=anomalies['y'], cmap='viridis')
    plt.colorbar(label='Network Load')
    plt.title('Anomaly Intensity Over Time')
    plt.xlabel('Timestamp')
    plt.ylabel('Network Load')
    plt.tight_layout()
    plt.savefig(anomaly_intensity_plot_path)

    # Send the zip file
    return send_file(hourly_anomalies_plot_path, mimetype='image/png', as_attachment=True, download_name="hourly_anomalies_plot.png")

@app.route('/download_anomaly_intensity_plot', methods=['GET'])
def download_anomaly_intensity_plot():
    plot_path = '/tmp/plots/anomaly_intensity_plot.png'
    return send_file(plot_path, mimetype='image/png', as_attachment=True, download_name="anomaly_intensity_plot.png")

if __name__ == '__main__':
    app.run(debug=True)
