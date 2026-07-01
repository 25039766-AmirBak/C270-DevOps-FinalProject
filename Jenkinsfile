pipeline {
    agent any

    // Ensures Jenkins uses the stable NodeJS version configured on your server
    tools {
        nodejs 'NodeJS' 
    }

    stages {
        stage('Checkout Code') {
            steps {
                // Pulls the latest code from your GitHub repository
                checkout scm
            }
        }

        stage('Backend Foundation') {
            steps {
                // Steps into the backend folder and installs dependencies
                dir('backend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Frontend Compilation') {
            steps {
                // Steps into your new React folder
                dir('frontend') {
                    // Installs the required React packages
                    sh 'npm install'
                    // Compiles the dashboard into a highly efficient production build
                    sh 'npm run build'
                }
            }
        }
    }
}