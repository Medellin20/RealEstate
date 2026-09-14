const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const ts = require('typescript');

const schemaModule = { exports: {} };
const source = fs.readFileSync(path.join(__dirname, '../lib/validations/property.ts'), 'utf8');
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.CommonJS },
});
new Function('require', 'module', 'exports', outputText)(require, schemaModule, schemaModule.exports);
const { propertySchema } = schemaModule.exports;

const form = {
  title: 'Appartement Amsterdam', slug: 'appartement-amsterdam',
  propertyType: 'appartement', city: 'Amsterdam', monthlyPrice: '1200',
  surfaceM2: '65', bedrooms: '2', bathrooms: '1',
  contractType: 'Période indéterminée', interiorType: 'Non meublé',
  maintenanceCondition: 'Bien', constructionType: 'Bâtiment existant', status: 'draft',
};
const optionalFields = ['latitude', 'longitude', 'rooms', 'floor', 'floorsCount', 'volumeM3', 'constructionYear'];

test('an apartment can be created with empty optional numeric inputs', () => {
  for (const empty of ['', '   ', undefined]) {
    const result = propertySchema.parse({
      ...form, ...Object.fromEntries(optionalFields.map(field => [field, empty])),
    });
    for (const field of optionalFields) assert.equal(result[field], undefined);
    // Server actions validate again after client-side coercion.
    assert.deepEqual(propertySchema.parse(result), result);
  }
});

test('provided optional numbers retain valid zero values and their constraints', () => {
  const result = propertySchema.parse({ ...form, rooms: '0', floor: '0', constructionYear: '2000' });
  assert.equal(result.rooms, 0);
  assert.equal(result.floor, 0);
  assert.equal(result.constructionYear, 2000);
  for (const [field, value] of [['floorsCount', '0'], ['volumeM3', '0'], ['constructionYear', '999'], ['rooms', '-1'], ['latitude', '91'], ['floor', 'abc']]) {
    assert.equal(propertySchema.safeParse({ ...form, [field]: value }).success, false, field);
  }
});

test('required price and surface still reject empty values', () => {
  for (const field of ['monthlyPrice', 'surfaceM2']) {
    assert.equal(propertySchema.safeParse({ ...form, [field]: '' }).success, false);
  }
});
