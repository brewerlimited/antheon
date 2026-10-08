// Business facts and images are sourced from Pioneer Bros' own website.
// Asset-level URLs and original sizes: assets/pioneer/provenance.json.
export const siteData = {
  name: 'Pioneer Bros', legalName: 'Pioneer Bros Scaffolding Limited',
  tagline: 'Good people. Great heights.',
  logo: './assets/pioneer/pioneer-logo.png',
  isDemo: false, preview: true,
  phoneDisplay: '07494 456874', phoneHref: 'tel:+447494456874',
  contactName: 'Mitchell', email: 'office@pioneerbrosscaffolding.com',
  whatsapp: null, // The source website does not confirm a WhatsApp channel.
  submissionEndpoint: null, // Email drafts are prepared locally until an endpoint is connected.
  sourceWebsite: 'https://www.pioneerbrosscaffolding.com/',
  canonical: 'https://www.antheon.co.uk/previews/pioneer-bros',
  address: {streetAddress:'2 Victoria Square, Victoria Street',addressLocality:'St Albans',postalCode:'AL1 3TF',addressCountry:'GB'},
  serviceAreas: [], credentials: [],
  hero: [
    {image:'./assets/pioneer/hero-scaffold.webp',alt:'Pioneer Bros scaffolding around a brick property',label:'Access shaped around the building',position:'center 46%'},
    {image:'./assets/pioneer/hero-temporary-roof.webp',alt:'Pioneer Bros temporary roof over a large brick and stone building',label:'Protection for the work ahead',position:'center 48%'},
    {image:'./assets/pioneer/hero-residential-roof.webp',alt:'Pioneer Bros roof scaffold around a house under a blue sky',label:'A solid start for your next project',position:'center 52%'}
  ],
  capabilities: [
    {id:'roof',label:'Roof & chimney',title:'A little protection. A lot of possibility.',description:'Temporary roofs and chimney access that give your project room to progress. Tell us about the work, and we’ll shape the access around it.',items:['Temporary roofs','Chimney stacks','Roof-level access'],image:'./assets/pioneer/hero-temporary-roof.webp',alt:'Temporary roof structure from Pioneer Bros’ project gallery',work:'Roofing',building:'House'},
    {id:'facade',label:'Every elevation',title:'Every building has its own story.',description:'Adaptable tube and fitting access for domestic, commercial and industrial projects. From a single elevation to access around the whole building.',items:['Tube & fitting scaffolding','Domestic projects','Commercial & industrial access'],image:'./assets/pioneer/commercial-frontage.webp',alt:'Pioneer Bros scaffold along a multi-storey frontage',position:'center 43%',work:'Rendering',building:'Commercial'},
    {id:'technical',label:'Complex access',title:'For the places that need a different approach.',description:'Technical scaffolding for demanding access requirements, with drawings and calculations available on request.',items:['Hanging scaffolds','Cantilever scaffolds','Truss outs'],image:'./assets/pioneer/industrial-access.webp',alt:'Tube and fitting scaffold around an industrial structure',work:'Maintenance',building:'Industrial'},
    {id:'internal',label:'Beyond the outside',title:'Support at every level.',description:'Access for the spaces, people and materials that keep a job moving. Discuss your scope with a team that understands the bigger picture.',items:['Stair towers & bird cage scaffolds','Staging','Hoists'],image:'./assets/pioneer/facade-access.webp',alt:'Pioneer Bros access platforms and scaffold structure',work:'Maintenance',building:'Commercial'}
  ],
  gallery: [
    {image:'./assets/pioneer/hero-temporary-roof.webp',title:'Room for the whole project.',category:'Temporary roofs',alt:'Large temporary roof above scaffolding around a brick and stone building',kind:'House',work:'Roofing'},
    {image:'./assets/pioneer/heritage-access.webp',title:'Care around every detail.',category:'Access scaffolding',alt:'Scaffold around a brick building with arched blue doors',kind:'Commercial',work:'Brickwork'},
    {image:'./assets/pioneer/domestic-access.webp',title:'A better way to get there.',category:'Domestic access',alt:'Scaffolding around a brick and render home',kind:'House',work:'Rendering'},
    {image:'./assets/pioneer/hero-residential-roof.webp',title:'Covered. From the start.',category:'Temporary roofs',alt:'Temporary roof over a house beneath a blue sky',kind:'House',work:'Roofing'},
    {image:'./assets/pioneer/commercial-frontage.webp',title:'Access for every elevation.',category:'Access scaffolding',alt:'Pioneer Bros scaffold extending up a multi-storey street frontage',kind:'Commercial',work:'Rendering'},
    {image:'./assets/pioneer/industrial-access.webp',title:'Ready for a bigger brief.',category:'Industrial access',alt:'Scaffolding around an industrial building',kind:'Industrial',work:'Maintenance'},
    {image:'./assets/pioneer/chimney-access.webp',title:'Right where you need it.',category:'Chimney access',alt:'Scaffold platforms providing access to a domestic chimney and roof edge',kind:'House',work:'Chimney works'},
    {image:'./assets/pioneer/facade-access.webp',title:'Space to do the job well.',category:'Access scaffolding',alt:'Scaffolding giving access along a building facade',kind:'Commercial',work:'Windows'}
  ]
};
