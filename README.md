# B1 Assistant - SAP Business One skill for Alexa
Detailed how to - http://bit.ly/2dGJv9d
complete demo - https://www.youtube.com/watch?v=WaXXYcMfgSs

## Prerequisites
- SAP Business One on HANA 9.2 PL04 (or higher)
	- Lower versions works with limited features (no prediction)
- SAP Business One Service Layer

## Installation - SAP HANA App
You can clone this repository and create a new project on your HANA system or import the Delivery Unity available on the link above.

Access the HANA Admin Tools dashboard (http://hanaserver:8000/sap/hana/xs/admin)
	- set a HANA user and password for the file: b1Assistant > lib > annonuser.xssqlcc
	- set a B1 User and Password (Service Layer) for xshttpdests files on b1Assistant > lib > http
	

Use the index.html file to test your app.

## Installation - Alexa Skill
Instructions available on the link above

## License
B1 Assistant prototype is released under the terms of the MIT license. See [LICENSE](LICENSE) for more information or see https://opensource.org/licenses/MIT.

## Special thanks
Thanks to the SAP Business One development team for the collaboration with the item prediction feature.

## Enhancements:
Check the enhaced scenarios on the _twitter_ branch: https://github.com/B1SA/b1Assistant/tree/twitter
