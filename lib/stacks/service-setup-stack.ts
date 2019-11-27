import { Repository } from '@aws-cdk/aws-ecr'
import { Construct, RemovalPolicy, Stack, StackProps } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'
import { ServiceDeploymentPipeline } from '../constructs/service-deployment-pipeline'
import { ServiceDeploymentStack } from './service-deployment-stack'

interface ServiceSetupStackProps extends StackProps {
    serviceName: string
    deploymentRole: Role
    hostedZone: {
        id: string
        name: string
    }
    serviceSource: {
        repo: string
        githubTokenName: string
        branch: string
        owner: string
    }
}

export class ServiceSetupStack extends Stack {
    constructor(scope: Construct, id: string, props: ServiceSetupStackProps) {
        super(scope, id, props)

        const ecrRepository = new Repository(this, 'EcrRepository', {
            repositoryName: `${props.serviceName}-repo`,
            removalPolicy: RemovalPolicy.DESTROY
        })

        const serviceDeploymentStack = new ServiceDeploymentStack(scope, `${props.serviceName}-service-stack`, {
            ...props,
            ecrRepository: ecrRepository,
            containerPort: 8083,
            environmentVars: {
                PORT: '8083',
                SERVICE_NAME: props.serviceName
            },
            dnsName: props.serviceName
        })

        new ServiceDeploymentPipeline(this, 'DeploymentPipeline', {
            ...props,
            serviceStackName: serviceDeploymentStack.stackName,
            ecrRepository: ecrRepository
        })
    }
}
