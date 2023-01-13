import faker from 'faker';
// utils

const companies = [...Array(24)].map((_, index) => ({
  id: `C${index + 1}`,
  name: faker.name.findName(),
  domain: faker.name.findName(),
  websiteUrl: faker.internet.domainName(),
  naicsCode: faker.random.alphaNumeric(10),
  yelpUrl: faker.internet.domainName(),
  g2CrowdUrl: faker.internet.domainName(),
  tags: faker.lorem.words(3),
  createdOn: `${faker.date.between('2015-01-01', '2015-01-05').toLocaleDateString()} ${faker.date
    .between('2015-01-01', '2015-01-05')
    .toLocaleTimeString()}`,
  updatedOn: `${faker.date.between('2015-01-01', '2015-01-05').toLocaleDateString()} ${faker.date
    .between('2015-01-01', '2015-01-05')
    .toLocaleTimeString()}`,
  lastModifiedBy: faker.name.findName()
}));

export default companies;
