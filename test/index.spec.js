const { resolve } = require('path');
const pkg = require('../package.json');
const { expect } = require('chai');
const DOM = require('./dom');

describe('<vari-bio/>', function () {

  let dom, bio;

  before(function () {
    dom = new DOM();
    require(resolve(pkg.browser));
  });

  after(function () {
    dom.destroy();
  });

  beforeEach(function () {
    bio = document.body.appendChild(document.createElement('vari-bio'));
  });

  afterEach(function () {
    document.body.removeChild(bio);
  });

  it('should mount a component', function () {
    expect(bio.shadowRoot).to.exist;
  });
});