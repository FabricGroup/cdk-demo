import { expect as expectCDK, haveResourceLike, ResourcePart } from '@aws-cdk/assert'
import cdk = require('@aws-cdk/core')
import Cdk = require('../lib/service-setup-stack')

test('Service Setup Stack Properties Should be set', () => {
    const app = new cdk.App();
    const stack = new Cdk.ServiceSetupStack(app, 'ServiceSetupStack', {});
    expectCDK(stack).to(haveResourceLike('AWS::ECR::Repository', {
      Properties: {
        RepositoryName: 'goose-repo'
      },
      DeletionPolicy: 'Retain'
    }, ResourcePart.CompleteDefinition))
});
