def getBucketS3(env) {
    if (env == 'production') {
        return 'web-sellercenter-production'
    } else if (env == 'demo') {
        return 'web-sellercenter-demo'
    } else if(env == 'sandbox') {
        return 'web-sellercenter-sandbox'
    } else if(env == 'staging') {
        return 'web-sellercenter-staging'
    } else {
        return 'web-sellercenter-dev'
    }
}

pipeline {
    agent {
        node {
            label 'worker'
        }
    }

    options {
        timestamps()
    }

    parameters {
        choice(
            name: 'CI_GIT_TYPE',
            choices: ['', 'branch', 'commit', 'tag'],
            description: 'Which Environment?'
        )
        string(
            name: 'CI_GIT_SOURCE',
            defaultValue: '',
            description: 'Which git source?'
        )
    }
    environment {
        SINBAD_REPO = 'web-sinbad-seller-center'
        LOGROCKET = 'fbtbt4:sinbad-seller-center:jWEpJiG1FMFyOms5DyeP'
        AWS_CREDENTIAL = 'automation_aws'
        SINBAD_ENV = "${env.JOB_BASE_NAME}"
        BUCKET_UPLOAD = getBucketS3(SINBAD_ENV)
        WOKRSPACE = "${env.WORKSPACE}"
    }
    stages {
        stage('Checkout') {
            steps {
                script {
                    if(params.CI_GIT_TYPE != '' || params.CI_GIT_SOURCE != '') {
                        if(params.CI_GIT_TYPE == 'branch' || params.CI_GIT_TYPE == ''){
                            checkout([
                                $class: 'GitSCM',
                                branches: [[name: "refs/remotes/origin/${params.CI_GIT_SOURCE}"]],
                                doGenerateSubmoduleConfigurations: scm.doGenerateSubmoduleConfigurations,
                                extensions: scm.extensions,
                                userRemoteConfigs: scm.userRemoteConfigs
                            ])
                        } else if(params.CI_GIT_TYPE == 'commit') {
                            checkout([
                                $class: 'GitSCM',
                                branches: [[name: "${params.CI_GIT_SOURCE}"]],
                                doGenerateSubmoduleConfigurations: scm.doGenerateSubmoduleConfigurations,
                                extensions: scm.extensions,
                                userRemoteConfigs: scm.userRemoteConfigs
                            ])
                        } else if(params.CI_GIT_TYPE == 'tag') {
                            checkout([
                                $class: 'GitSCM',
                                branches: [[name: "refs/tags/${params.CI_GIT_SOURCE}"]],
                                doGenerateSubmoduleConfigurations: scm.doGenerateSubmoduleConfigurations,
                                extensions: scm.extensions,
                                userRemoteConfigs: scm.userRemoteConfigs
                            ])
                        }
                    }

                    env.GIT_MESSAGE = sh(returnStdout: true, script: 'git log -1 --pretty=%B').trim()
                    env.GIT_COMMIT = sh(returnStdout: true, script: 'git rev-parse HEAD').trim()
                    env.GIT_COMMIT_SHORT = sh(returnStdout: true, script: "git rev-parse --short=8 ${env.GIT_COMMIT}").trim()
                    env.GIT_AUTHOR = sh(returnStdout: true, script: "git --no-pager show -s --format='%an' ${env.GIT_COMMIT}").trim()
                    env.GIT_TAG = sh(returnStdout: true, script: "git describe --tags").trim()
                }
            }
        }
        stage('Download ENV') {
            steps {
                script{
                    withAWS(credentials: "${AWS_CREDENTIAL}") {
                        s3Download(file: 'src/environments/environment.ts', bucket: 'sinbad-env', path: "${SINBAD_ENV}/${SINBAD_REPO}/environment.ts", force: true)
                        if(SINBAD_ENV == 'production'){
                            s3Download(file: 'src/assets/js/newrelic.js', bucket: 'sinbad-env', path: "${SINBAD_ENV}/${SINBAD_REPO}/newrelic.js", force: true)
                        }
                    }
                    sh "sed -i 's/GIT_TAG/${env.GIT_TAG}/g' src/environments/environment.ts"
                    sh "sed -i 's/GIT_COMMIT_SHORT/${env.GIT_COMMIT_SHORT}/g' src/environments/environment.ts"
                }
            }
        }
        stage('Install') {
            steps {
                sh "npm ci"
            }
        }
        stage('Build') {
            steps {
                script{
                    if (SINBAD_ENV == 'production') {
                        sh "npm run build-production"
                    } else if (SINBAD_ENV == 'demo') {
                        sh "npm run build-demo"
                    } else if(SINBAD_ENV == 'preproduction') {
                        sh "npm run build-release"
                    } else if(SINBAD_ENV == 'staging') {
                        sh "npm run build-staging"
                    } else {
                        sh "npm run build-development"
                    }
                }
            }
        }
        stage('Deploy') {
            steps {
                script {
                    sh "echo ${env.GIT_TAG}_${env.GIT_COMMIT_SHORT} > ${WOKRSPACE}/dist/supplier-center/VERSION"
                    withAWS(credentials: "${AWS_CREDENTIAL}") {
                        s3Upload(bucket:"${BUCKET_UPLOAD}", workingDir:'dist/supplier-center', includePathPattern:'**/*');
                    }
                }
            }
        }
        stage('Automation UI Test') {
            agent {
                docker { 
                        image 'public.ecr.aws/f0u5l3r6/sdet-testcafe:latest'
                    }
            }
            steps {
                script{
                    catchError(buildResult: 'SUCCESS', stageResult: 'FAILURE'){
                        try{
                            sh """
                                #!/bin/bash
                                cd sdet && \
                                mv .envexample.${env.JOB_BASE_NAME} .env && \
                                npm install --verbose && \
                                npm run test
                            """
                        }catch (Exception e) {
                            echo 'Exception occurred: ' + e.toString()
                            sh "exit 1"
                        }
                    }
                }
            }
            post {
                always {
                    publishHTML (
                        target : [
                            allowMissing: false,
                            alwaysLinkToLastBuild: true,
                            keepAll: true,
                            reportDir: 'sdet/reports',
                            reportFiles: 'report.html',
                            reportName: 'Automation UI Test Report',
                            reportTitles: "automation-ui-test-reports"
                            ]
                    )
                }
            }
        }
    }

    post {
        always {
            // junit '**/target/*.xml'
            slackSend color: '#8cff00', message: "${SINBAD_REPO} (${SINBAD_ENV}) -> ${env.GIT_MESSAGE} by <${env.GIT_AUTHOR}>", channel: "#jenkins"
        }
        failure {
            slackSend color: '#ff0000', message: "(FAILED) ${SINBAD_REPO} (${SINBAD_ENV}) -> ${env.GIT_MESSAGE} by <${env.GIT_AUTHOR}>", channel: "#jenkins"
        }
    }
}