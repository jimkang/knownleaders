// From https://www.ssa.gov/oact/babynames/decades/century.html
var commonFirstNames = [
  'James',
  'Mary',
  'John',
  'Patricia',
  'Robert',
  'Jennifer',
  'Michael',
  'Elizabeth',
  'William',
  'Linda',
  'David',
  'Barbara',
  'Richard',
  'Susan',
  'Joseph',
  'Jessica',
  'Thomas',
  'Margaret',
  'Charles',
  'Sarah',
  'Christopher',
  'Karen',
  'Daniel',
  'Nancy',
  'Matthew',
  'Betty',
  'Anthony',
  'Lisa',
  'Donald',
  'Dorothy',
  'Mark',
  'Sandra',
  'Paul',
  'Ashley',
  'Steven',
  'Kimberly',
  'Andrew',
  'Donna',
  'Kenneth',
  'Carol',
  'George',
  'Michelle',
  'Joshua',
  'Emily',
  'Kevin',
  'Amanda',
  'Brian',
  'Helen',
  'Edward',
  'Melissa',
  'Ronald',
  'Deborah',
  'Timothy',
  'Stephanie',
  'Jason',
  'Laura',
  'Jeffrey',
  'Rebecca',
  'Ryan',
  'Sharon',
  'Gary',
  'Cynthia',
  'Jacob',
  'Kathleen',
  'Nicholas',
  'Amy',
  'Eric',
  'Shirley',
  'Stephen',
  'Anna',
  'Jonathan',
  'Angela',
  'Larry',
  'Ruth',
  'Justin',
  'Brenda',
  'Scott',
  'Pamela',
  'Frank',
  'Nicole',
  'Brandon',
  'Katherine',
  'Raymond',
  'Virginia',
  'Gregory',
  'Catherine',
  'Benjamin',
  'Christine',
  'Samuel',
  'Samantha',
  'Patrick',
  'Debra',
  'Alexander',
  'Janet',
  'Jack',
  'Rachel',
  'Dennis',
  'Carolyn',
  'Jerry',
  'Emma',
  'Tyler',
  'Maria',
  'Aaron',
  'Heather',
  'Henry',
  'Diane',
  'Douglas',
  'Julie',
  'Jose',
  'Joyce',
  'Peter',
  'Evelyn',
  'Adam',
  'Frances',
  'Zachary',
  'Joan',
  'Nathan',
  'Christina',
  'Walter',
  'Kelly',
  'Harold',
  'Victoria',
  'Kyle',
  'Lauren',
  'Carl',
  'Martha',
  'Arthur',
  'Judith',
  'Gerald',
  'Cheryl',
  'Roger',
  'Megan',
  'Keith',
  'Andrea',
  'Jeremy',
  'Ann',
  'Terry',
  'Alice',
  'Lawrence',
  'Jean',
  'Sean',
  'Doris',
  'Christian',
  'Jacqueline',
  'Albert',
  'Kathryn',
  'Joe',
  'Hannah',
  'Ethan',
  'Olivia',
  'Austin',
  'Gloria',
  'Jesse',
  'Marie',
  'Willie',
  'Teresa',
  'Billy',
  'Sara',
  'Bryan',
  'Janice',
  'Bruce',
  'Julia',
  'Jordan',
  'Grace',
  'Ralph',
  'Judy',
  'Roy',
  'Theresa',
  'Noah',
  'Rose',
  'Dylan',
  'Beverly',
  'Eugene',
  'Denise',
  'Wayne',
  'Marilyn',
  'Alan',
  'Amber',
  'Juan',
  'Madison',
  'Louis',
  'Danielle',
  'Russell',
  'Brittany',
  'Gabriel',
  'Diana',
  'Randy',
  'Abigail',
  'Philip',
  'Jane',
  'Harry',
  'Natalie',
  'Vincent',
  'Lori',
  'Bobby',
  'Tiffany',
  'Johnny',
  'Alexis',
  'Logan',
  'Kayla'
];

const bandQuery = `SELECT ?group WHERE {
  ?group wdt:P31/wdt:P279* wd:Q2088357          
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}
`;

const orgQuery = `SELECT ?group WHERE {
   ?group wdt:P31/wdt:P279* wd:Q43229     
  SERVICE wikibase:label { bd:serviceParam wikibase:language "[AUTO_LANGUAGE]". }
}
`;

module.exports = {
  commonFirstNames,
  bandEntitiesURL: 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(bandQuery),
  orgEntitiesURL: 'https://query.wikidata.org/sparql?query=' + encodeURIComponent(orgQuery),
};