import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { CdkSetupStack } from '../lib/cdk-setup-stack'
import { InfraStack } from '../lib/infra-stack'
import cdk = require('@aws-cdk/core')

test('Service Repo should be created', () => {
  const app = new cdk.App()
  const infraStack = new InfraStack(app, 'infra-stack')
  const role = infraStack.deploymentRole
  const props = {
    serviceStackName: 'test',
    deploymentRole: role,
    cdkSource: {repo: 'cdk-repo', owner: 'AwesomeOwner', developmentBranch: 'development', masterBranch: 'master', githubTokenName: '/token'},
    serviceSource: {repo: 'service-repo', owner: 'AwesomeOwner', branch: 'master', githubTokenName: '/token'}
  }

  const stack = new CdkSetupStack(app, 'CdkDeployStack', props)

  expectCDK(stack).to(haveResourceLike('AWS::ECR::Repository', {
    Properties: {
      RepositoryName: 'goose-repo'
    },
    DeletionPolicy: 'Retain'
  }, ResourcePart.CompleteDefinition))
})
