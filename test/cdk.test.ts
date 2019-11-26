import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import { InfraStack } from '../lib/stacks/infra-stack'
import { CdkSetupStack } from '../lib/stacks/cdk-setup-stack'
import { ServiceSetupStack } from '../lib/stacks/service-setup-stack'
import { Repository } from '@aws-cdk/aws-ecr'
import { ServiceDeploymentStack } from '../lib/stacks/service-deployment-stack'
import cdk = require('@aws-cdk/core')

test('Should create infra stack', () => {
    const app = new cdk.App()
    // WHEN
    const stack = new InfraStack(app, 'InfraStack')
    // THEN
    expectCDK(stack).to(haveResourceLike('AWS::IAM::Role', {
        Properties: {
            RoleName: 'cdk-deployer'
        }
    }, ResourcePart.CompleteDefinition))
})

test('CDK setup stack should create pipeline', () => {
    const app = new cdk.App()
    const infraStack = new InfraStack(app, 'infra-stack')
    const props = {
        cdkSource: {
            repo: 'test-repo',
            githubTokenName: '/awesome/token',
            owner: 'Acme',
            branch: 'master'
        },
        deploymentRole: infraStack.deploymentRole,
        serviceSetupStackName: 'awesome-stack'
    }

    const stack = new CdkSetupStack(app, 'CdkDeployStack', props)

    expectCDK(stack).to(haveResourceLike('AWS::CodePipeline::Pipeline', {
        Properties: {
            Name: 'cdk-deployment-pipeline'
        }
    }, ResourcePart.CompleteDefinition))
})

test('Service Repo should be created', () => {
    const app = new cdk.App()
    const infraStack = new InfraStack(app, 'infra-stack')
    const props = {
        serviceName: 'test-service',
        serviceSource: {
            repo: 'test-repo',
            githubTokenName: '/awesome/token',
            owner: 'Acme',
            branch: 'master'
        },
        hostedZone: {
            id: 'Z20QY3N3V946UQ',
            name: 'dev.fabricgroup.com.au'
        },
        deploymentRole: infraStack.deploymentRole
    }

    const stack = new ServiceSetupStack(app, 'CdkDeployStack', props)

    expectCDK(stack).to(haveResourceLike('AWS::ECR::Repository', {
        Properties: {
            RepositoryName: 'test-service-repo'
        },
        DeletionPolicy: 'Delete'
    }, ResourcePart.CompleteDefinition))
})

test('ServiceDeploymentStack should create fargate service', () => {
    const app = new cdk.App()
    const infraStack = new InfraStack(app, 'infra-stack')
    const props = {
        hostedZone: {
            id: 'Z20QY3N3V946UQ',
            name: 'dev.fabricgroup.com.au'
        },
        ecrRepository: new Repository(infraStack, 'ECRRepo'),
        containerPort: 8083,
        environmentVars: {
            PORT: '8083'
        },
        dnsName: 'test-service'
    }

    const stack = new ServiceDeploymentStack(app, 'CdkDeployStack', props)

    expectCDK(stack).to(haveResourceLike('AWS::ECS::Service', {
        Properties: {
            LaunchType: 'FARGATE'
        }
    }, ResourcePart.CompleteDefinition))
})
