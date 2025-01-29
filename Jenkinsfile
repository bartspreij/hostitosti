pipeline {
    agent any

    environment {
        PULUMI_ACCESS_TOKEN = credentials('PULUMI_ACCESS_TOKEN')  
    }

    stages {
        stage('Checkout') {
            steps {
                git 'git@github.com:bartspreij/hostitosti.git'
            }
        }
        stage('Deploy Servarr') {
            steps {
                sh 'pulumi up --yes' 
            }
        }
    }

    post {
        always {
            cleanWs()  // Clean the workspace after build
        }
        success {
            echo 'Pipeline completed successfully!'
        }
        failure {
            echo 'Pipeline failed.'
        }
    }
