const restCountriesFixture = [
  {
    name: { common: 'Botswana' },
    cca2: 'BW',
    cca3: 'BWA',
    capital: ['Gaborone'],
    region: 'Africa',
    subregion: 'Southern Africa',
    population: 2351627,
    currencies: {
      BWP: { name: 'Botswana pula', symbol: 'P' }
    },
    flags: { svg: 'https://flagcdn.com/bw.svg' }
  }
];

const buildWorldBankPayload = (indicatorId, indicatorName, values) => ([
  { page: 1, pages: 1, per_page: '60', total: values.length },
  values.map(({ year, value }) => ({
    indicator: { id: indicatorId, value: indicatorName },
    country: { id: 'BW', value: 'Botswana' },
    value,
    date: String(year)
  }))
]);

const worldBankFixtures = {
  budget: buildWorldBankPayload(
    'GC.XPN.TOTL.CD',
    'General government final consumption expenditure (current US$)',
    [
      { year: 2023, value: 2500000000 },
      { year: 2022, value: 2300000000 },
      { year: 2021, value: 2100000000 }
    ]
  ),
  health: buildWorldBankPayload(
    'SH.XPD.CHEX.PC.CD',
    'Current health expenditure per capita (current US$)',
    [
      { year: 2023, value: 650 },
      { year: 2022, value: 620 },
      { year: 2021, value: 590 }
    ]
  ),
  education: buildWorldBankPayload(
    'SE.XPD.TOTL.PC.CD',
    'Government expenditure on education, total per capita (current US$)',
    [
      { year: 2023, value: 550 },
      { year: 2022, value: 530 },
      { year: 2021, value: 500 }
    ]
  ),
  corruption: buildWorldBankPayload(
    'CC.EST',
    'Control of Corruption: Estimate',
    [
      { year: 2023, value: 0.65 },
      { year: 2022, value: 0.6 },
      { year: 2021, value: 0.55 }
    ]
  )
};

const setupBotswanaApiMocks = () => {
  global.fetch = jest.fn((url) => {
    let parsed;
    try {
      parsed = new URL(url);
    } catch (error) {
      parsed = null;
    }

    const hostname = parsed?.hostname;
    const pathname = parsed?.pathname || '';

    if (hostname === 'restcountries.com') {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => restCountriesFixture
      });
    }

    if (hostname === 'api.worldbank.org' && pathname.includes('/indicator/GC.XPN.TOTL.CD')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => worldBankFixtures.budget
      });
    }

    if (hostname === 'api.worldbank.org' && pathname.includes('/indicator/SH.XPD.CHEX.PC.CD')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => worldBankFixtures.health
      });
    }

    if (hostname === 'api.worldbank.org' && pathname.includes('/indicator/SE.XPD.TOTL.PC.CD')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => worldBankFixtures.education
      });
    }

    if (hostname === 'api.worldbank.org' && pathname.includes('/indicator/CC.EST')) {
      return Promise.resolve({
        ok: true,
        status: 200,
        json: async () => worldBankFixtures.corruption
      });
    }

    return Promise.resolve({
      ok: false,
      status: 404,
      json: async () => ({ error: 'Not found' })
    });
  });
};

module.exports = { setupBotswanaApiMocks };
