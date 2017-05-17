## GRC
An open source Governance Risk Compliance (GRC) solution for corporates and government

### Documention
Coming soon...

### Prerequisites:

1. NodeJS >= 6.9
Install the latest version of nodejs (http://nodejs.org/). You will also get npm along with nodejs.

2. Gulp : JavaScript Tasks Runner
Install Gulp's command line interface (CLI) globally.
`npm install -g gulp-cli`

3. Bower : Package Manager
Bower is a command line utility. Install it with npm.
`npm install -g bower`

4. Yarn : Fast, reliable, and secure dependency management (https://yarnpkg.com/)
`npm install -g yarn`

5. Git : download and install git from here - http://git-scm.com/

### Setup:

Clone the repository :

`git clone https://github.com/riski-io/grc.git`

Run `yarn install` to grab the dependencies.

### Running the app

Run `gulp serve` to start the app in development mode

### Build

Run `gulp build` to build the application , it also run all the tests

### Testing

Running `gulp test` will run the client and server unit tests with karma and mocha.

Use `gulp test:server` to only run server tests

Use `gulp test:client` to only run client tests.
