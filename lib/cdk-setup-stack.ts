import { BaseStack } from './base-stack'
import { Construct, StackProps } from '@aws-cdk/core'
import { Role } from '@aws-cdk/aws-iam'
import { CdkDeployPipeline } from './cdk-deploy-pipeline'
import { CdkBuildPipeline } from './cdk-build-pipeline'
import { ServiceSetupConstruct } from './service-setup-construct'

interface CdkDeployStackProps extends StackProps {
  serviceStackName: string;
  deploymentRole: Role
}

const githubTokenName = 'cdk-demo/github/goose-token'

export class CdkSetupStack extends BaseStack {
  serviceSetupConstruct: ServiceSetupConstruct

  constructor(scope: Construct, id: string, props: CdkDeployStackProps) {
    super(scope, id, props)

    const baseProps = {
      githubTokenName: githubTokenName
    }

    new CdkBuildPipeline(this, 'CdkBuildPipeline', {
      ...baseProps,
      pipelinePrefix: 'cdk-build'
    })

    new CdkDeployPipeline(this, 'CdkDeployPipeline', {
      ...baseProps,
      pipelinePrefix: 'cdk-deployment',
      deploymentRole: props.deploymentRole
    })

    this.serviceSetupConstruct = new ServiceSetupConstruct(this, 'ServiceSetup', {
      ...baseProps, serviceStackName: props.serviceStackName,
      deploymentRole: props.deploymentRole
    })
  }
}