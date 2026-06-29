pipeline {
    agent any
    
    // This block tells Jenkins to load the Node tool
    tools {
        nodejs 'NodeJS' 
    }
    
    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }
        stage('Build Backend') {
            steps {
                // This tells Jenkins to go inside the backend folder first
                dir('backend') {
                    echo 'Installing backend dependencies...'
                    sh 'npm install'
                }
            }
        }
    }
}