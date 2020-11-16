# B1 Assistant [DEPREACTED]

Thank you for your interest in the B1 Assistant. The original prototype has been modified a lot since its inception. The goal was to make it simpler to deploy so more and more partners could use it. The result, is the [B1 Assistant Lite](https://github.com/SAP-samples/b1-assistant-lite)  which can be deployed in minutes. It has a smaller functionality scope but completely serves its purpose: to enable you in how the integration works and how to work with Alexa. The whole deployment.

The instructions below **are not maintained and haven't been tested in a log time**. Please consider the new version mentioned above.

___


## Prerequisites
- SAP Business One on HANA 9.2 PL04 (or higher)
	- Lower version will work without Predictive Features
- SAP Business One Service Layer
- SBODEMOUS database

## Installation - HANA App (BackEnd)
Download this repository and import it on your HANA System using HANA Studio or the Web Based Development Workbench. Make sure all the files are activated. use the [test page](index.html) if needed.

## Installation - Alexa Skill
Apart from the AWS Lambda option explained on the link above. There are [additional deployment options](skill/README.md) for the Alexa skill code. Feel free to use any of them.

# Examples
Find usage examples in the [SAMPLES](samples) folder.

## License
B1 Assistant prototype is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.
 
## Enhancements:
Check the enhaced scenarios and how to install them in the _twitter_ branch: https://github.com/B1SA/b1Assistant/tree/twitter

## Special thanks
Thanks to the SAP Business One development team for the collaboration with the item prediction feature.
