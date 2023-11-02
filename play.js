"use strict"

const SUF = 0
const OPP = 1
const SUF_NAME = "Suffragist"
const OPP_NAME = "Opposition"

let ui = {
	status: document.getElementById("status"),
	player: [
		document.getElementById("role_Suffragist"),
		document.getElementById("role_Opposition"),
	],
    cards: [ null ],
}

// :r !python3 tools/gencards.py
const CARDS = [null, { "id": 1, "type": "support", "title": "Seneca Falls Convention", "era": "Start", "text": "Add 1 :purple_campaigner and 1 :yellow_campaigner in the Northeast region. Receive 2 :badge and add 2 :purple_or_yellow_cube in New York." }, { "id": 2, "type": "support", "title": "Property Rights for Women", "era": "Early", "text": "For the remainder of the turn, roll :d6 instead of :d4 when taking a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 3, "type": "support", "title": "Frances Willard", "era": "Early", "text": "Add 1 :congressional_marker in Congress and receive 2 :badge." }, { "id": 4, "type": "support", "title": "A Vindication of the Rights of Woman", "era": "Early", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 5, "type": "support", "title": "Union Victory", "era": "Early", "text": "Playable if *The Civil War* is in effect. Roll :d6. On a roll of 3-6, receive two :badge and move *The Civil War* to the discard pile." }, { "id": 6, "type": "support", "title": "Fifteenth Amendment", "era": "Early", "text": "Playable if *The Civil War* is not in effect. Roll :d6. On a roll of 3-6, add 2 :congressional_marker in Congress and add 8 :purple_or_yellow_cube anywhere, no more than 2 per state.", "persistent": "rest_of_game" }, { "id": 7, "type": "support", "title": "Reconstruction", "era": "Early", "text": "Playable if *The Civil War* is not in effect and the *Fifteenth Amendment* is in effect. Add 1 :purple_or_yellow_cube in each of Virginia, North Carolina, South Carolina, Georgia, Florida, Alabama, Mississippi, Tennessee, Arkansas, Louisiana and Texas." }, { "id": 8, "type": "support", "title": "Petition to Congress", "era": "Early", "text": "Add 1 :congressional_marker in Congress and add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 9, "type": "support", "title": "Lucy Stone", "era": "Early", "text": "Receive 1 :badge and add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 10, "type": "support", "title": "Susan B. Anthony Indicted", "era": "Early", "text": "Receive 1 :badge and add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 11, "type": "support", "title": "Anna Dickinson", "era": "Early", "text": "Receive 1 :badge and add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 12, "type": "support", "title": "Frederick Douglass", "era": "Early", "text": "Roll :d8. Add that number :purple_or_yellow_cube in the Northeast region, no more than 1 per state." }, { "id": 13, "type": "support", "title": "Frances Harper", "era": "Early", "text": "Roll :d8. Add that number :purple_or_yellow_cube in the Atlantic & Appalachia region, no more than 1 per state." }, { "id": 14, "type": "support", "title": "The Union Signal", "era": "Early", "text": "Receive 1 :badge and add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 15, "type": "support", "title": "Sojourner Truth", "era": "Early", "text": "Roll :d8. Add that number :purple_or_yellow_cube in the Midwest region, no more than 1 per state." }, { "id": 16, "type": "support", "title": "Pioneer Women", "era": "Early", "text": "Roll :d8. Add that number :purple_or_yellow_cube in the Plains region, no more than 1 per state." }, { "id": 17, "type": "support", "title": "Women to the Polls", "era": "Early", "text": "Add 2 :purple_or_yellow_cube in each of New Jersey, Pennsylvania and Delaware." }, { "id": 18, "type": "support", "title": "National Woman\u2019s Rights Convention", "era": "Early", "text": "Playable if *The Civil War* is not in effect. Add 1 :congressional_marker in Congress and 1 :purple_or_yellow_cube in one state of each region." }, { "id": 19, "type": "support", "title": "National American Woman Suffrage Association", "era": "Middle", "text": "Add 1 :purple_campaigner in the Atlantic & Appalachia region. Receive 3 :badge." }, { "id": 20, "type": "support", "title": "Jeannette Rankin", "era": "Middle", "text": "Roll :d6. On a roll of 3-6, add 1 :congressional_marker in Congress and 4 :purple_or_yellow_cube in Montana and 2 :purple_or_yellow_cube in each other state in the Plains region." }, { "id": 21, "type": "support", "title": "Ida B. Wells-Barnett", "era": "Middle", "text": "Receive 2 :badge. Add 2 :purple_or_yellow_cube in Illinois and 1 :purple_or_yellow_cube in each other state in the Midwest region." }, { "id": 22, "type": "support", "title": "The Club Movement", "era": "Middle", "text": "Receive 4 :badge." }, { "id": 23, "type": "support", "title": "Equality League of Self-Supporting Women", "era": "Middle", "text": "Receive 2 :badge. Add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 24, "type": "support", "title": "Emmeline Pankhurst", "era": "Middle", "text": "Roll :d6 :d6. Add that number :purple_or_yellow_cube anywhere, no more than 2 per state." }, { "id": 25, "type": "support", "title": "\u201cDebate Us, You Cowards!\u201d", "era": "Middle", "text": "Roll :d6 :d6. Remove that number :red_cube anywhere, no more than 2 per state." }, { "id": 26, "type": "support", "title": "Carrie Chapman Catt", "era": "Middle", "text": "Receive 2 :badge. Add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 27, "type": "support", "title": "Alice Paul & Lucy Burns", "era": "Middle", "text": "Roll :d6 :d6. Remove that number :red_cube anywhere, no more than 2 per state." }, { "id": 28, "type": "support", "title": "Inez Milholland", "era": "Middle", "text": "Add 1 :congressional_marker in Congress. Receive 2 :badge and add 1 :purple_or_yellow_cube in one state of each region." }, { "id": 29, "type": "support", "title": "Farmers for Suffrage", "era": "Middle", "text": "Add 2 :purple_or_yellow_cube in each of Wisconsin, Minnesota, Iowa, North Dakota and South Dakota." }, { "id": 30, "type": "support", "title": "Zitkala-\u0160a", "era": "Middle", "text": "Add 2 :purple_or_yellow_cube in each of North Dakota, South Dakota, Nebraska, Montana and Wyoming." }, { "id": 31, "type": "support", "title": "Helen Keller", "era": "Middle", "text": "Roll :d6 :d6. Add that number :purple_or_yellow_cube anywhere, no more than 2 per state." }, { "id": 32, "type": "support", "title": "Maria de Lopez", "era": "Middle", "text": "Recieve 2 :badge. Add 2 :purple_or_yellow_cube in each of California, Nevada and Arizona." }, { "id": 33, "type": "support", "title": "Marie Louise Bottineau Baldwin", "era": "Middle", "text": "For the remainder of the turn, roll :d6 instead of :d4 when taking a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 34, "type": "support", "title": "The West\u2019s Awakening", "era": "Middle", "text": "Add 2 :purple_or_yellow_cube in each state in the West region." }, { "id": 35, "type": "support", "title": "Southern Strategy", "era": "Middle", "text": "Receive 2 :badge. Add 2 :purple_or_yellow_cube in each state in the South region. Select and place in front of you 1 available Strategy card.", "persistent": "rest_of_game" }, { "id": 36, "type": "support", "title": "Women\u2019s Trade Union League", "era": "Late", "text": "Add 1 :yellow_campaigner in the Atlantic & Appalachia region. Add 1 :congressional_marker in Congress and receive 2 :badge." }, { "id": 37, "type": "support", "title": "The Young Woman Citizen", "era": "Late", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 38, "type": "support", "title": "1918 Midterm Elections", "era": "Late", "text": "Roll :d6. On a roll of 3-6, add 3 :congressional_marker in Congress." }, { "id": 39, "type": "support", "title": "Woodrow Wilson", "era": "Late", "text": "Spend 4 :badge to select and place in front of you 1 available Strategy card." }, { "id": 40, "type": "support", "title": "Maud Wood Park", "era": "Late", "text": "Add 2 :congressional_marker in Congress." }, { "id": 41, "type": "support", "title": "Voter Registration", "era": "Late", "text": "The Suffragist player rolls :d8 instead of :d6 during Final Voting.", "persistent": "ballot_box" }, { "id": 42, "type": "support", "title": "Processions for Suffrage", "era": "Late", "text": "For the remainder of the turn, roll :d8 instead of :d6 when taking a Lobbying action. For each 6, 7 or 8 rolled, add 1 :congressional_marker in Congress.", "persistent": "rest_of_turn" }, { "id": 43, "type": "support", "title": "Prison Tour Special", "era": "Late", "text": "For the remainder of the turn, roll :d6 instead of :d4 when taking a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 44, "type": "support", "title": "Victory Map", "era": "Late", "text": "Add 1 :purple_or_yellow_cube in each state in the West and Plains regions. Add 1 :purple_or_yellow_cube in each of Texas, Arkansas, Illinois, Michigan, New York and Vermont." }, { "id": 45, "type": "support", "title": "Women and World War I", "era": "Late", "text": "Playable if *War in Europe* is in effect. Add 10 :purple_or_yellow_cube anywhere, no more than 2 per state." }, { "id": 46, "type": "support", "title": "Eighteenth Amendment", "era": "Late", "text": "Roll :d6. On a roll of 3-6, add 1 congressional_marker in Congress and receive 2 :badge.", "persistent": "rest_of_game" }, { "id": 47, "type": "support", "title": "Mary McLeod Bethune", "era": "Late", "text": "Roll :d8 :d8. Remove that number :red_cube anywhere, no more than 2 per state." }, { "id": 48, "type": "support", "title": "Make a Home Run for Suffrage", "era": "Late", "text": "Roll :d8 :d8. Remove that number :red_cube anywhere, no more than 2 per state." }, { "id": 49, "type": "support", "title": "Mary Church Terrell", "era": "Late", "text": "Roll :d8 :d8. Add that number :purple_or_yellow_cube anywhere, no more than 2 per state." }, { "id": 50, "type": "support", "title": "Tea Parties for Suffrage", "era": "Late", "text": "Add 1 :congressional_marker in Congress and receive 4 :badge" }, { "id": 51, "type": "support", "title": "Dr. Mabel Ping-Hua Lee", "era": "Late", "text": "Roll :d8 :d8. Add that number :purple_or_yellow_cube anywhere, no more than 2 per state." }, { "id": 52, "type": "support", "title": "Miss Febb Wins the Last Vote", "era": "Late", "text": "The Suffragist player wins all ties during Final Voting.", "persistent": "ballot_box" }, { "id": 53, "type": "opposition", "title": "The Patriarchy", "era": "Start", "text": "Add 1 :red_campaigner in the South region. Receive 4 :badge. Add 1 :red_cube in each state in the Northeast region, the Atlantic & Appalachia region, the South region and the Midwest region." }, { "id": 54, "type": "opposition", "title": "The Civil War", "era": "Early", "text": "Remove 1 :congressional_marker from Congress. For the remainder of the turn, the Suffragist player may not add :purple_or_yellow_cube to any state in the Atlantic & Appalachia and South regions.", "persistent": "rest_of_turn" }, { "id": 55, "type": "opposition", "title": "15th Divides Suffragists", "era": "Early", "text": "Playable if *Fifteenth Amendment* is in effect. Remove all :purple_cube in up to 4 states. The Suffragist player loses 2 :badge." }, { "id": 56, "type": "opposition", "title": "Senator Joseph Brown", "era": "Early", "text": "Remove 1 :congressional_marker from Congress and add 2 :red_cube in Georgia." }, { "id": 57, "type": "opposition", "title": "Minor v. Happersett", "era": "Early", "text": "Roll :d6. On a roll of 3-6, remove 1 :congressional_marker and add 2 :red_cube in Missouri." }, { "id": 58, "type": "opposition", "title": "Senate Rejects Suffrage Amendment", "era": "Early", "text": "Roll :d6. On a roll of 3-6, receive 1 :badge and remove 1 :congressional_marker from Congress." }, { "id": 59, "type": "opposition", "title": "South Dakota Rejects Suffrage", "era": "Early", "text": "Roll :d6. On a roll of 3-6, remove 1 :congressional_marker and add 2 :red_cube in South Dakota." }, { "id": 60, "type": "opposition", "title": "Gerrymandering", "era": "Early", "text": "Remove all :yellow_cube in up to 2 states." }, { "id": 61, "type": "opposition", "title": "Border States", "era": "Early", "text": "Add 1 :red_cube in each of Delaware, Maryland, West Virginia, Kentucky and Missouri." }, { "id": 62, "type": "opposition", "title": "Horace Greeley", "era": "Early", "text": "Place 2 :red_cube in each of New York and Connecticut." }, { "id": 63, "type": "opposition", "title": "New York Newspapers", "era": "Early", "text": "Place 2 :red_cube in each of New York and New Jersey." }, { "id": 64, "type": "opposition", "title": "Senator George Vest", "era": "Early", "text": "Remove 1 :congressional_marker from Congress and add 2 :red_cube in Missouri." }, { "id": 65, "type": "opposition", "title": "Catharine Beecher", "era": "Early", "text": "Roll :d4. Add that number :red_cube anywhere, no more than 1 per state." }, { "id": 66, "type": "opposition", "title": "Progress, Not Politics", "era": "Early", "text": "Draw 6 cards from your Draw Deck. Place any number of the 6 cards on the top of your Draw Deck and the rest at the bottom of your Draw Deck." }, { "id": 67, "type": "opposition", "title": "Southern \u201cHospitality\u201d", "era": "Early", "text": "Place 1 :red_cube in each of Virginia, North Carolina, South Carolina, Georgia and Tennessee." }, { "id": 68, "type": "opposition", "title": "Beer Brewers", "era": "Early", "text": "Playable if Eighteenth Amendment is not in effect. For the remainder of the turn, roll :d6 instead of :d4 when taking a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 69, "type": "opposition", "title": "Southern Resentment", "era": "Early", "text": "Playable if *Fifteenth Amendment* is in effect. Add 1 :red_cube in each of Texas, Louisiana, Arkansas, Mississippi and Alabama." }, { "id": 70, "type": "opposition", "title": "Old Dixie", "era": "Early", "text": "Add 1 :red_cube in each of Louisiana, Mississippi, Alabama, Georgia and Florida." }, { "id": 71, "type": "opposition", "title": "NAOWS Forms", "era": "Middle", "text": "Add 1 :red_campaigner in the Northeast region. Receive 2 :badge." }, { "id": 72, "type": "opposition", "title": "Woman and the Republic", "era": "Middle", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 73, "type": "opposition", "title": "The Ladies\u2019 Battle", "era": "Middle", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 74, "type": "opposition", "title": "Backlash to the Movement", "era": "Middle", "text": "Remove 6 :purple_or_yellow_cube from anywhere, no more than 2 per state." }, { "id": 75, "type": "opposition", "title": "Xenophobia", "era": "Middle", "text": "Remove all from any 1 :purple_cube state. Remove all :yellow_cube from any 1 state." }, { "id": 76, "type": "opposition", "title": "\u201cO Save Us Senators, From Ourselves\u201d", "era": "Middle", "text": "Add 1 :red_cube in one state of each region." }, { "id": 77, "type": "opposition", "title": "Emma Goldman", "era": "Middle", "text": "Roll :d6. Add that number :red_cube anywhere, no more than 1 per state." }, { "id": 78, "type": "opposition", "title": "The Great 1906 San Francisco Earthquake", "era": "Middle", "text": "Remove all :yellow_cube and :purple_cube from California. The Suffragist player loses 1 :badge." }, { "id": 79, "type": "opposition", "title": "A Threat to the Ideal of Womanhood", "era": "Middle", "text": "For the remainder of the turn, the Suffragist player must spend 1 :badge in order to play a card as an event.", "persistent": "rest_of_turn" }, { "id": 80, "type": "opposition", "title": "\u201cUnwarranted, Unnecessary & Dangerous Interference\u201d", "era": "Middle", "text": "Add 1 :red_cube in one state of each region." }, { "id": 81, "type": "opposition", "title": "Conservative Opposition", "era": "Middle", "text": "For the remainder of the turn, roll :d6 instead of :d4 when taking a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 82, "type": "opposition", "title": "The SSWSC", "era": "Middle", "text": "Playable if *Southern Strategy* is in effect. Receive 2 :badge and add 6 :red_cube in the South region, no more than 2 per state." }, { "id": 83, "type": "opposition", "title": "Western Saloons Push Suffrage Veto", "era": "Middle", "text": "Playable if *Eighteenth Amendment* is not in effect. Place 2 :red_cube in Arizona and 1 :red_cube in each of New Mexico, Nevada and Utah." }, { "id": 84, "type": "opposition", "title": "Transcontinental Railroad", "era": "Middle", "text": "Move each :red_campaigner to any region(s) without paying any :badge and then take a Campaigning action." }, { "id": 85, "type": "opposition", "title": "White Supremacy and the Suffrage Movement", "era": "Middle", "text": "Playable if *Southern Strategy* is in effect. Remove all :yellow_cube in up to 4 states. The Suffragist player loses 2 :badge." }, { "id": 86, "type": "opposition", "title": "Senator John Weeks", "era": "Middle", "text": "Remove 1 :congressional_marker from Congress and add 2 :red_cube in New Hampshire." }, { "id": 87, "type": "opposition", "title": "Senator \u201cCotton Ed\u201d Smith", "era": "Middle", "text": "Remove 1 :congressional_marker from Congress and add 2 :red_cube in South Carolina." }, { "id": 88, "type": "opposition", "title": "War in Europe", "era": "Late", "text": "Remove 1 :congressional_marker from Congress. For the remainder of the turn, the Suffragist player must spend 1 :badge in order to take a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 89, "type": "opposition", "title": "1918 Pandemic", "era": "Late", "text": "Remove 1 :congressional_marker from Congress. For the remainder of the turn, the Suffragist player must spend 1 :badge in order to play a card as an event.", "persistent": "rest_of_turn" }, { "id": 90, "type": "opposition", "title": "The Business of Being a Woman", "era": "Late", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 91, "type": "opposition", "title": "The Eden Sphinx", "era": "Late", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 92, "type": "opposition", "title": "Big Liquor\u2019s Big Money", "era": "Late", "text": "Playable if *Eighteenth Amendment* is not in effect. For the remainder of the turn, roll :d6 instead of :d4 when taking a Campaigning action.", "persistent": "rest_of_turn" }, { "id": 93, "type": "opposition", "title": "Red Scare", "era": "Late", "text": "Remove all :purple_cube in up to 2 states." }, { "id": 94, "type": "opposition", "title": "Southern Women\u2019s Rejection League", "era": "Late", "text": "Playable if *Southern Strategy* is in effect. Roll :d8. Add that number :red_cube in the South region, no more than 2 per state." }, { "id": 95, "type": "opposition", "title": "United Daughters of the Confederacy", "era": "Late", "text": "Playable if *Southern Strategy* is in effect. Roll :d8. Add that number :red_cube in the South region, no more than 2 per state." }, { "id": 96, "type": "opposition", "title": "Cheers to \u201cNo on Suffrage\u201d", "era": "Late", "text": "Playable if *Eighteenth Amendment* is not in effect. Roll :d8. Add that number :red_cube anywhere, no more than 2 per state." }, { "id": 97, "type": "opposition", "title": "The Unnecessary Privilege", "era": "Late", "text": "Roll :d6. Add that number :red_cube anywhere, no more than 1 per state." }, { "id": 98, "type": "opposition", "title": "Voter Suppression", "era": "Late", "text": "The Opposition player rolls :d8 instead of :d6 during Final Voting.", "persistent": "ballot_box" }, { "id": 99, "type": "opposition", "title": "Anti-Suffrage Riots", "era": "Late", "text": "The Suffragist player must discard 2 cards from their hand at random and then draw 2 cards from the Suffragist Draw Deck." }, { "id": 100, "type": "opposition", "title": "American Constitutional League", "era": "Late", "text": "Spend 4 :badge to select, and place in front of you, 1 available Strategy card." }, { "id": 101, "type": "opposition", "title": "The Woman Patriot", "era": "Late", "text": "Receive 3 :badge." }, { "id": 102, "type": "opposition", "title": "Governor Clement\u2019s Veto", "era": "Late", "text": "Replace 1 :green_check in a state with 1 :red_x." }, { "id": 103, "type": "opposition", "title": "Senator Henry Cabot Lodge", "era": "Late", "text": "Remove 1 :congressional_marker from Congress and add 2 :red_cube in Massachusetts" }, { "id": 104, "type": "opposition", "title": "Senator William Borah", "era": "Late", "text": "Remove 1 :congressional_marker from Congress and add 2 :red_cube in Utah" }, { "id": 105, "type": "strategy", "title": "Efficient Organizing", "text": "Receive 5 :badge." }, { "id": 106, "type": "strategy", "title": "Reconsideration", "text": "Replace 1 :red_x with 2 :purple_or_yellow_cube or 1 :green_check with 2 :red_cube." }, { "id": 107, "type": "strategy", "title": "Opposition Research", "text": "Your opponent must lose half (rounded up) of their :badge." }, { "id": 108, "type": "strategy", "title": "Change In Plans", "text": "Look at your opponent\u2019s hand. Your opponent must discard 1 card of your choice that does not have a :yellow_campaigner / :purple_campaigner / :red_campaigner on it. Your opponent then draws 1 replacement card from their Draw Deck." }, { "id": 109, "type": "strategy", "title": "Bellwether State", "text": "Select one state and remove any :red_cube and add 4 :purple_or_yellow_cube or remove any :purple_or_yellow_cube and add 4 :red_cube." }, { "id": 110, "type": "strategy", "title": "Superior Lobbying", "text": "Roll 4 :d8. For each 6, 7 or 8 rolled, add 1 :congressional_marker to Congress or remove 1 :congressional_marker from Congress." }, { "id": 111, "type": "strategy", "title": "The Winning Plan", "text": "Draw 6 cards from your Draw Deck. Play 1 card for its event immediately. Place any number of the remaining 5 cards on the top of your Draw Deck and the rest at the bottom of your Draw Deck." }, { "id": 112, "type": "strategy", "title": "Regional Focus", "text": "Add 1 :purple_or_yellow_cube or 1 :red_cube per state in any one region." }, { "id": 113, "type": "strategy", "title": "Eye on the Future", "text": "Playable if it is Turn 5 or Turn 6. Look through your Draw Deck and select 1 card and play for its event immediately. Then reshuffle your Draw Deck." }, { "id": 114, "type": "strategy", "title": "Transportation", "text": "Move all of your :purple_campaigner and :yellow_campaigner OR :red_campaigner to any region(s) without playing any :badge and then take a Campaigning action." }, { "id": 115, "type": "strategy", "title": "Counter Strat", "text": "Remove one card that is \u201cin effect for the remainder of the turn\u201d and place it in the appropriate discard pile." }, { "id": 116, "type": "strategy", "title": "National Focus", "text": "Add 2 :purple_or_yellow_cube or 2 :red_cube in one state of each region." }, { "id": 117, "type": "states", "title": "California", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 118, "type": "states", "title": "Utah", "text": "Add 6 :pink_yellow_cube or 6 :red_cube in the West region, no more than 2 per state." }, { "id": 119, "type": "states", "title": "Montana", "text": "Receive 2 :badge." }, { "id": 120, "type": "states", "title": "Kansas", "text": "Add 6 :pink_yellow_cube or 6 :red_cube in the Plains region, no more than 2 per state." }, { "id": 121, "type": "states", "title": "Texas", "text": "Add 6 :pink_yellow_cube or 6 :red_cube in the South region, no more than 2 per state." }, { "id": 122, "type": "states", "title": "Georgia", "text": "Receive 2 :badge." }, { "id": 123, "type": "states", "title": "Illinois", "text": "Add 6 :pink_yellow_cube or 6 :red_cube in the Midwest region, no more than 2 per state." }, { "id": 124, "type": "states", "title": "Ohio", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 125, "type": "states", "title": "Pennsylvania", "text": "Add 6 :pink_yellow_cube or 6 :red_cube in the Atlantic & Appalachia region, no more than 2 per state." }, { "id": 126, "type": "states", "title": "Virginia", "text": "Draw 2 cards from your Draw Deck. Discard 1 card and play the other card for its event immediately." }, { "id": 127, "type": "states", "title": "New York", "text": "Add 6 :pink_yellow_cube or 6 :red_cube in the Northeast region, no more than 2 per state." }, { "id": 128, "type": "states", "title": "New Jersey", "text": "Receive 2 :badge." }]

// :r !python3 tools/genlayout.py
const LAYOUT = {
	"NorthEast": [914, 190],
	"AtlanticAppalachia": [797, 366],
	"MidWest": [612, 298],
	"South": [574, 505],
	"Plains": [406, 236],
	"West": [127, 300],
	"NJ": [960, 277],
	"CT": [1019, 237],
	"RI": [1036, 165],
	"MA": [1014, 74],
	"ME": [963, 119],
	"NH": [889, 96],
	"VT": [817, 157],
	"NY": [863, 207],
	"DE": [997, 345],
	"MD": [952, 404],
	"NC": [864, 385],
	"VA": [861, 332],
	"PA": [849, 257],
	"WV": [811, 314],
	"KY": [743, 351],
	"TN": [716, 401],
	"OH": [762, 287],
	"IN": [708, 285],
	"IL": [663, 333],
	"MI": [724, 228],
	"WI": [639, 198],
	"MO": [601, 357],
	"IA": [563, 256],
	"MN": [561, 163],
	"FL": [835, 572],
	"SC": [828, 433],
	"GA": [779, 465],
	"AL": [715, 470],
	"MS": [662, 477],
	"LA": [623, 544],
	"AR": [605, 436],
	"TX": [482, 516],
	"OK": [519, 417],
	"KS": [497, 348],
	"NE": [477, 273],
	"SD": [471, 205],
	"ND": [468, 134],
	"CO": [374, 331],
	"WY": [341, 229],
	"MT": [335, 133],
	"NM": [351, 440],
	"AZ": [245, 432],
	"UT": [264, 310],
	"NV": [180, 290],
	"ID": [233, 203],
	"CA": [126, 367],
	"OR": [135, 173],
	"WA": [158, 97],
}

function is_action(action) {
	if (view.actions && view.actions[action])
		return true
	return false
}

function is_card_action(action, card) {
	if (view.actions && view.actions[action] && view.actions[action].includes(card))
		return true
	return false
}

function is_piece_action(i) {
	if (view.actions && view.actions.piece && view.actions.piece.includes(i))
		return true
	return false
}

function is_space_action(i) {
	if (view.actions && view.actions.space && view.actions.space.includes(i))
		return true
	return false
}

function on_blur(evt) {
	document.getElementById("status").textContent = ""
}

function on_focus_space(evt) {
	document.getElementById("status").textContent = evt.target.my_name
}

function on_focus_piece(evt) {
	if (evt.target.my_name)
		document.getElementById("status").textContent = evt.target.my_name
}

function on_click_card(evt) {
	if (evt.button === 0) {
		if (send_action('card', evt.target.my_card))
			evt.stopPropagation()
	}
}

function on_click_space(evt) {
	if (evt.button === 0) {
		if (send_action('space', evt.target.my_space))
			evt.stopPropagation()
	}
}

function on_click_cube(evt) {
	if (evt.button === 0) {
		if (send_action('piece', evt.target.my_cube))
			evt.stopPropagation()
	}
}

function create(t, p, ...c) {
	let e = document.createElement(t)
	Object.assign(e, p)
	e.append(c)
	return e
}

function build_user_interface() {
	let elt

    for (let c = 1; c <= 128; ++c) {
		elt = ui.cards[c] = create("div", {
			className: `card card_${c}`,
			my_card: c,
			onmousedown: on_click_card
		})
	}

}

function on_focus_card_tip(card_number) {
	document.getElementById("tooltip").className = "card card_" + card_number
}

function on_blur_card_tip() {
	document.getElementById("tooltip").classList = "card hide"
}

function sub_card_name(match, p1, offset, string) {
	let c = p1 | 0
	let n = CARDS[c].title
	return `<span class="tip" onmouseenter="on_focus_card_tip(${c})" onmouseleave="on_blur_card_tip()">${n}</span>`
}

function on_log(text) {
	let p = document.createElement("div")

	if (text.match(/^>/)) {
		text = text.substring(1)
		p.className = 'i'
	}

	text = text.replace(/&/g, "&amp;")
	text = text.replace(/</g, "&lt;")
	text = text.replace(/>/g, "&gt;")
	text = text.replace(/C(\d+)/g, sub_card_name)

	if (text.match(/^\.h1/)) {
		text = text.substring(4)
		p.className = 'h1'
	}

	if (text.match(/^\.h2/)) {
		text = text.substring(4)
		p.className = 'h2'
	}

	if (text.match(/^\.h3/)) {
		text = text.substring(4)
		p.className = 'h3'
	}

	p.innerHTML = text
	return p
}

function support_info() {
	if (view.support_hand === 1)
		return "1 card in hand";
	return view.support_hand + " cards in hand";
}

function opposition_info() {
	if (view.opposition_hand === 1)
		return "1 card in hand";
	return view.opposition_hand + " cards in hand";
}

function on_update() {
    console.log("VIEW", view)

	ui.player[SUF].classList.toggle("active", view.active === SUF_NAME)
	ui.player[OPP].classList.toggle("active", view.active === OPP_NAME)

	document.getElementById("support_info").textContent = support_info()
	document.getElementById("opposition_info").textContent = opposition_info()

	document.getElementById("hand").replaceChildren()
	document.getElementById("states_draw").replaceChildren()
	document.getElementById("strategy_draw").replaceChildren()

    if (view.hand) {
		document.getElementById("hand_panel").classList.remove("hide")
		for (let c of view.hand)
			document.getElementById("hand").appendChild(ui.cards[c])
	} else {
		document.getElementById("hand_panel").classList.add("hide")
	}

	for (let c of view.states_draw)
		document.getElementById("states_draw").appendChild(ui.cards[c])
	for (let c of view.strategy_draw)
		document.getElementById("strategy_draw").appendChild(ui.cards[c])

    action_button("draw", "Draw")

    action_button("skip", "Skip")
	action_button("pass", "Pass")
	action_button("done", "Done")
	action_button("undo", "Undo")

	// XXX
	action_button("restart", "Restart")
}

build_user_interface()
