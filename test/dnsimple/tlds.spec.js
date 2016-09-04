'use strict';

var testUtils = require('../testUtils');
var dnsimple = require('../../lib/dnsimple')({
  accessToken: testUtils.getAccessToken(),
});

const expect = require('chai').expect;
const nock = require('nock');

describe('tlds', function() {
  describe('#listTlds', function() {
    var fixture = testUtils.fixture('listTlds/success.http');

    it('supports pagination', function(done) {
      var endpoint = nock('https://api.dnsimple.com')
        .get('/v2/tlds?page=1')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.listTlds({page: 1});

      endpoint.done();
      done();
    });

    it('supports extra request options', function(done) {
      var endpoint = nock('https://api.dnsimple.com')
        .get('/v2/tlds?foo=bar')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.listTlds({query: {foo: 'bar'}});

      endpoint.done();
      done();
    });

    it('supports sorting', function(done) {
      var endpoint = nock('https://api.dnsimple.com')
        .get('/v2/tlds?sort=tld%3Aasc')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.listTlds({sort: 'tld:asc'});

      endpoint.done();
      done();
    });

    it('produces a tld list', function(done) {
      nock('https://api.dnsimple.com')
        .get('/v2/tlds')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.listTlds().then(function(response) {
        var tlds = response.data;
        expect(tlds.length).to.eq(2);
        expect(tlds[0].tld).to.eq('ac');
        done();
      }, function(error) {
        done(error);
      });
    });

    it('exposes the pagination info', function(done) {
      nock('https://api.dnsimple.com')
        .get('/v2/tlds')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.listTlds().then(function(response) {
        var pagination = response.pagination;
        expect(pagination).to.not.be.null;
        expect(pagination.current_page).to.eq(1);
        done();
      }, function(error) {
        done(error);
      });
    });
  });

  describe('#getTld', function() {
    var fixture = testUtils.fixture('getTld/success.http');

    it('produces a tld', function(done) {
      nock('https://api.dnsimple.com')
        .get('/v2/tlds/com')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.getTld('com').then(function(response) {
        var tld = response.data;
        expect(tld.tld).to.eq('com');
        done();
      }, function(error) {
        done(error);
      });
    });
  });

  describe('#getExtendedAttributes', function() {
    it('produces a collection of extended attributes', function(done) {
      var fixture = testUtils.fixture('getTldExtendedAttributes/success.http');

      nock('https://api.dnsimple.com')
        .get('/v2/tlds/uk/extended_attributes')
        .reply(fixture.statusCode, fixture.body);

      dnsimple.tlds.getExtendedAttributes('uk').then(function(response) {
        var extended_attributes = response.data;
        expect(extended_attributes.length).to.eq(4)
        expect(extended_attributes[0].name).to.eq('uk_legal_type');
        expect(extended_attributes[0].description).to.eq('Legal type of registrant contact');
        expect(extended_attributes[0].required).to.be.false;
        expect(extended_attributes[0].options.length).to.eq(17);
        expect(extended_attributes[0].options[0].title).to.eq('UK Individual');
        expect(extended_attributes[0].options[0].value).to.eq('IND');
        expect(extended_attributes[0].options[0].description).to.eq('UK Individual (our default value)');
        done();
      }, function(error) {
        done(error);
      });
    });

    describe('when there are no extended attributes for a TLD', function() {
      var fixture = testUtils.fixture('getTldExtendedAttributes/success-noattributes.http');

      it('returns an empty collection', function(done) {
        nock('https://api.dnsimple.com')
          .get('/v2/tlds/com/extended_attributes')
          .reply(fixture.statusCode, fixture.body);

        dnsimple.tlds.getExtendedAttributes('com').then(function(response) {
          expect(response.data).to.eql([]);
          done();
        }, function(error) {
          done(error);
        });
      });
    });
  });

});