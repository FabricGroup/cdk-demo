#Changelog

##Checkpoint 1
* Create `infra-stack` with deployer role.
* Deployer role will be used to deploy cloudformation stacks.

##Checkpoint 2
* Create `cdk-setup-stack` to create pipeline that deploys the same stack.
* Source is github (master). 
* Stack will be deployed by deployer role. 
* Changesets will be created and deployed. Pipeline will retrigger on change.
