import { BaseStack } from './base-stack'
import { Construct, StackProps } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'
import { CdkDeployPipeline } from './cdk-deploy-pipeline'
import { ServiceSetupConstruct } from './service-setup-construct'

interface CdkDeployStackProps extends StackProps {
    serviceStackName: string
    deploymentRole: Role
    cdkSource: {
        repo: string
        owner: string
        githubTokenName: string
        masterBranch: string
    },
    serviceSource: {
        repo: string
        owner: string
        githubTokenName: string
        branch: string
    }
}

export class CdkSetupStack extends BaseStack {
    serviceSetupConstruct: ServiceSetupConstruct

    constructor(scope: Construct, id: string, props: CdkDeployStackProps) {
        super(scope, id, props)

        new CdkDeployPipeline(this, 'CdkDeployPipeline', {
            pipelinePrefix: 'cdk-deployment',
            deploymentRole: props.deploymentRole,
            cdkSource: {
                ...props.cdkSource,
                branch: props.cdkSource.masterBranch
            }
        })

        this.serviceSetupConstruct = new ServiceSetupConstruct(this, 'ServiceSetup', {
            serviceSource: props.serviceSource,
            serviceStackName: props.serviceStackName,
            deploymentRole: props.deploymentRole
        })
    }
}
