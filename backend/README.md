<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

# eSign Workflow - Sequential Signing
## Description
This project demonstrates an eSign workflow built using NestJS. The application implements a sequential signing process where each role completes its task before the document advances to the next stage.

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ git clone https://github.com/puneetsethi25/esign-nest.git
$ cd esign-workflow

$ npm install
```

## Compile and run the project
**Pre-requisites**: 
- Copy/Rename the file `.env.sample` to `.env.local`
- Add an `API_TOKEN` in the `.env.[your_env]` file at the bottom. For eg. if you are running on `local` environment, then  in your `.env.local`, add the value for `API_TOKEN` such as:
```
API_TOKEN=YOUR_TOKEN_VALUE
API_BASE_URL=https://sandbox.opensignlabs.com/api/v1/
```
****
```bash
# start dev with watch mode
$ npm run start:dev
# opens the app at http://localhost:3000

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

# Workflow Overview
## Role 1 Initiation:

##### Document Upload & Preview:
- Role 1 uploads a PDF document using the web interface. The document is stored locally (this can be easily changed to use S3 or another cloud storage service). The document is also previewed on the page.
##### Define Signing Tags:
- Role 1 defines the signing tags (position, dimensions, and page) for Role 2 and Role 3. At this stage, only Role 1's email is provided. A placeholder (dummy) email is used for Role 2, and Role 3's email is left unspecified.
##### Template Creation:
- The system creates a template using the provided document and signing tag information.
##### Role 2 Review and Signing:

## Role 2 Reviews and Add Role 3.

##### Dynamic Email Update:
- Role 2 updates Role 3's email with the correct address.
##### E-Sign and Forward:
- Once submitted, a signing URL is generated for Role 2. Role 2 clicks this link to open the OpenSign UI and electronically signs the document. After signing, the document is forwarded to Role 3.
## Role 3 Final Signing:
##### Receive and Sign:
- Once Role 2 has signed and updated Role 3's email, a signing URL for Role 3 is generated and sent to the provided email (for testing purposes, this link is displayed on the UI).
##### Completion:
- Role 3 clicks the signing URL to digitally sign the document via the OpenSign UI. After signing, the document is marked as finished in the OpenSign dashboard.
****
Note: For testing purposes, the signing URLs for both Role 2 and Role 3 are displayed on the same page. In a production implementation, these links would typically be sent to the appropriate email addresses.