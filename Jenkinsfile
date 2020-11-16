def getSshKeyFromEnv(env) {
    if (env == 'production') {
        return 'private_key_prod'
    } else if (env == 'demo') {
        return 'private_key_demo'
    } else if(env == 'sandbox') {
        return 'private_key_sandbox'
    } else if(env == 'staging') {
        return 'private_key_stg'
    } else {
        return 'private_key_dev'
    }
}

def getIpFromEnv(env) {
    if (env == 'production') {
        return '10.0.10.20'
    } else if (env == 'demo') {
        return '10.0.30.27'
    } else if(env == 'sandbox') {
        return '10.0.10.163'
    } else if(env == 'staging') {
        return '10.0.30.30'
    } else {
        return '10.0.50.30'
    }
}

def getDirFromEnv(env) {
    if (env == 'production') {
        return 'seller.sinbad.web.id'
    } else if (env == 'demo') {
        return 'seller-demo.sinbad.web.id'
    } else if(env == 'sandbox') {
        return 'seller-sandbox.sinbad.web.id'
    } else if(env == 'staging') {
        return 'seller-stg.sinbad.web.id'
    } else {
        return 'seller-dev.sinbad.web.id'
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
        SSH_KEY = getSshKeyFromEnv(SINBAD_ENV)
        SSH_IP = getIpFromEnv(SINBAD_ENV)
        SSH_DIR = getDirFromEnv(SINBAD_ENV)
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

                    // if (SINBAD_ENV != 'development') {
                    //     sh "logrocket release ${GIT_TAG}_${GIT_COMMIT_SHORT} --apikey=${LOGROCKET}"
                    //     sh "logrocket upload ${WOKRSPACE}/dist/supplier-center/ --release=${GIT_TAG}_${GIT_COMMIT_SHORT} --apikey=${LOGROCKET}"
                    // }

                    sh '''
                        if [ -f $WOKRSPACE/dist/supplier-center/*.map ]; then rm $WOKRSPACE/dist/supplier-center/*.map; fi && \
                        ssh -i ~/.ssh/$SSH_KEY deploy@$SSH_IP -o StrictHostKeyChecking=no -t "find /var/www/seller-center-bak -type f -mmin +20 -delete" && \
                        ssh -i ~/.ssh/$SSH_KEY deploy@$SSH_IP -o StrictHostKeyChecking=no -t "rsync -avz /var/www/$SSH_DIR/ /var/www/seller-center-bak" && \
                        rsync -avz --delete --force --omit-dir-times -e "ssh -i ~/.ssh/$SSH_KEY -o StrictHostKeyChecking=no" $WOKRSPACE/dist/supplier-center/ deploy@$SSH_IP:/var/www/$SSH_DIR
                    '''
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