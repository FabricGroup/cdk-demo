import { expect as expectCDK, matchTemplate, MatchStyle } from '@aws-cdk/assert';
import cdk = require('@aws-cdk/core');
import Cdk = require('../lib/service-setup-stack');

xtest('Empty Stack', () => {
    const app = new cdk.App();
    // WHEN
    const stack = new Cdk.ServiceSetupStack(app, 'MyTestStack', {});
    // THEN
    expectCDK(stack).to(matchTemplate({
      "Resources": {}
    }, MatchStyle.EXACT))
});
