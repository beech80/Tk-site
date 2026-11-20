/* ==========================================================================
   CONTENT — edit this block to update the museum. Rooms, signs, the shop and
   the chapter galleries are all built from it.
   ========================================================================== */
var SITE = {
  launchDate: '2027-01-03',
  contactEmail: null,           // e.g. 'hello@testaments.press' once it exists
  forms: { contact: null, newsletter: null }   // POST endpoints; null = not connected yet
};
var PHOTOS = [
  {id:'wall-upward',     w:2000,h:1333, alt:'A person in a green beanie and glasses stands against a textured wall, looking up into warm light.', chapter:null},
  {id:'glasses-closeup', w:2000,h:1333, alt:'Close-up of a person adjusting their glasses while looking upward, lit warmly from the side.', chapter:null},
  {id:'mural-portrait',  w:2000,h:1333, alt:'A person in a black hooded sweatshirt and cap stands in front of a large painted mural of faces.', chapter:'becoming'},
  {id:'mural-walk',      w:2000,h:1333, alt:'A person walks past a mural of a laughing face and hand-painted lettering.', chapter:'becoming'},
  {id:'mural-wide',      w:2000,h:1132, alt:'A person stands small against a wide mural of four painted portraits in black and white over red, gold and green.', chapter:'becoming'},
  {id:'guitar-tree',     w:1333,h:2000, alt:'A person plays an acoustic guitar beneath tall trees in autumn, fallen leaves covering the ground.', chapter:'flourish'},
  {id:'reach',           w:1333,h:2000, alt:'Seen from below, a person in a denim shirt reaches one arm up toward a canopy of yellow leaves, smiling.', chapter:'flourish'},
  {id:'railroad',        w:1723,h:1723, alt:'A person with a guitar case on their back walks beside railroad tracks through dark woods.', chapter:null},
  {id:'resonator',       w:2000,h:1326, alt:'Seen from below, a person in sunglasses plays a resonator guitar under autumn trees.', chapter:null}
];
/* status: 'draft' (hidden) | 'coming-soon' | 'published' | 'archived'.  To hang a photo in a chapter room, set PHOTOS[].chapter to its slug. */
var CHAPTERS = [
  {num:'001', slug:'flourish', title:'Flourish', subjects:['Kristen'], status:'coming-soon', progress:'Photography complete. Publication date to be confirmed.', intro:null, release:null, video:null, readable:false,
   edition:{price:null, currency:'USD', stock:null, state:'coming-soon'}},
  {num:'002', slug:'becoming', title:'Becoming', subjects:['JT'], status:'coming-soon', progress:'In development. Publication date to be confirmed.', intro:null, release:null, video:null, readable:false,
   edition:{price:null, currency:'USD', stock:null, state:'coming-soon'}},
  {num:'003', slug:'freedom', title:'Freedom', subjects:[], subjectsNote:'A couple · names to be confirmed', status:'coming-soon', progress:'Interview filmed. Editorial production in progress.', intro:null, release:null, video:null, readable:false,
   edition:{price:null, currency:'USD', stock:null, state:'coming-soon'}}
];
var STOCKISTS = [];   // confirmed partners only: {name, address}
