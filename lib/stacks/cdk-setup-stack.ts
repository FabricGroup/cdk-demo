import { BaseStack } from './base-stack'
import { Construct, StackProps } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'
import { CdkDeployPipeline } from '../constructs/cdk-deploy-pipeline'

interface CdkDeployStackProps extends StackProps {
    deploymentRole: Role
    cdkSource: {
        repo: string
        owner: string
        githubTokenName: string
        branch: string
    }
    serviceSetupStackNames: string[]
}

export class CdkSetupStack extends BaseStack {
    constructor(scope: Construct, id: string, props: CdkDeployStackProps) {
        super(scope, id, props)

        new CdkDeployPipeline(this, 'CdkDeployPipeline', props)
    }
}
