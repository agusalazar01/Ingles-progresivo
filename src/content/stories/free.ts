/**
 * Biblioteca de cuentos libres, sin modificar el texto original:
 * - Fábulas y cuentos ilustrados de African Storybook (vía Global Storybooks), licencia CC BY (con audio grabado).
 * - Fábulas de Esopo (traducción de V. S. Vernon Jones, 1912), dominio público.
 * - Cuentos clásicos de O. Henry, Saki, Oscar Wilde, Edgar Allan Poe y Frank R. Stockton, dominio público.
 * Los textos de dominio público vienen de Project Gutenberg (espejos de GITenberg). Sin audio grabado: los lee la voz del teléfono.
 */
export interface StoryPage { text: string; img: string | null; audio: string | null }
export interface FreeStory { id: string; title: string; author: string; art: string; voice: string; license: string; source: string; url: string; pages: StoryPage[] }

export const FREE_STORIES: FreeStory[] = [
 {
  "id": "tall-man",
  "title": "A very tall man",
  "author": "Cornelius Gulere",
  "art": "Catherine Groenewald",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=918",
  "pages": [
   {
    "text": "His hoe was too short.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/02.mp3"
   },
   {
    "text": "His doorway was too low.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/03.mp3"
   },
   {
    "text": "His bed was too short.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/04.mp3"
   },
   {
    "text": "His bicycle was too short.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/05.mp3"
   },
   {
    "text": "This man was too tall!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/06.mp3"
   },
   {
    "text": "He made a very long hoe handle.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/07.mp3"
   },
   {
    "text": "He made very high door frames.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/08.mp3"
   },
   {
    "text": "He made a very long bed.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/09.mp3"
   },
   {
    "text": "He bought a very high bicycle.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/10.mp3"
   },
   {
    "text": "He sat on a very high chair. He ate with a very long fork.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/11.mp3"
   },
   {
    "text": "He left his house and lived in a big forest. He lived for many years.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0001/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0001/mp3/12.mp3"
   }
  ]
 },
 {
  "id": "goat-dog-cow",
  "title": "Goat, Dog, and Cow",
  "author": "Fabian Wakholi",
  "art": "Marleen Visser, Ingrid Schechter",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=6380",
  "pages": [
   {
    "text": "Goat, Dog, and Cow were great friends. One day they went on a journey in a taxi.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/02.mp3"
   },
   {
    "text": "When they reached the end of their journey, the driver asked them to pay their fares. Cow paid her fare.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/03.mp3"
   },
   {
    "text": "Dog paid a bit extra, because he did not have the correct money.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/04.mp3"
   },
   {
    "text": "The driver was about to give Dog his change when Goat ran away without paying anything.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/05.mp3"
   },
   {
    "text": "The driver was very annoyed. He drove away without giving Dog his change.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/06.mp3"
   },
   {
    "text": "That is why, even today, Dog runs towards a car to peep inside and find the driver who owes him his change.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/07.mp3"
   },
   {
    "text": "Goat runs away from the sound of a car. She is afraid she will be arrested for not paying her fare.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/08.mp3"
   },
   {
    "text": "And Cow is not bothered when a car is coming. Cow takes her time crossing the road because she knows she paid her fare in full.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0004/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0004/mp3/09.mp3"
   }
  ]
 },
 {
  "id": "anansi",
  "title": "Anansi and Wisdom",
  "author": "Ghanaian folktale",
  "art": "Wiehan de Jager",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=1938",
  "pages": [
   {
    "text": "Long long ago people didn’t know anything. They didn’t know how to plant crops, or how to weave cloth, or how to make iron tools. The god Nyame up in the sky had all the wisdom of the world. He kept it safe in a clay pot.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0006/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0006/mp3/02.mp3"
   },
   {
    "text": "One day, Nyame decided that he would give the pot of wisdom to Anansi. Every time Anansi looked in the clay pot, he learned something new. It was so exciting!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0006/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0006/mp3/03.mp3"
   },
   {
    "text": "Greedy Anansi thought, “I’ll keep the pot safe at the top of a tall tree. Then I can have it all to myself!” He spun a long thread, wound it round the clay pot, and tied it to his stomach. He began to climb the tree. But it was hard climbing the tree with the pot bumping him in the knees all the time.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0006/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0006/mp3/04.mp3"
   },
   {
    "text": "All the time Anansi’s young son had been standing at the bottom of the tree watching. He said, “Wouldn’t it be easier to climb if you tied the pot to your back instead?” Anansi tried tying the clay pot full of wisdom to his back, and it really was a lot easier.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0006/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0006/mp3/05.mp3"
   },
   {
    "text": "In no time he reached the top of the tree. But then he stopped and thought, “I’m supposed to be the one with all the wisdom, and here my son was cleverer than me!” Anansi was so angry about this that he threw the clay pot down out of the tree.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0006/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0006/mp3/06.mp3"
   },
   {
    "text": "It smashed into pieces on the ground. The wisdom was free for everyone to share. And that is how people learned to farm, to weave cloth, to make iron tools, and all the other things that people know how to do.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0006/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0006/mp3/07.mp3"
   }
  ]
 },
 {
  "id": "what-doing",
  "title": "What are you doing?",
  "author": "Nina Orange",
  "art": "Wiehan de Jager",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=7292",
  "pages": [
   {
    "text": "I am singing.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/02.mp3"
   },
   {
    "text": "She is waving.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/03.mp3"
   },
   {
    "text": "I am clapping.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/04.mp3"
   },
   {
    "text": "She is stretching.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/05.mp3"
   },
   {
    "text": "He is calling.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/06.mp3"
   },
   {
    "text": "I am answering.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/07.mp3"
   },
   {
    "text": "She is listening.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/08.mp3"
   },
   {
    "text": "What are you doing?",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0008/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0008/mp3/09.mp3"
   }
  ]
 },
 {
  "id": "like-to-read",
  "title": "I like to read!",
  "author": "Letta Machoga",
  "art": "Wiehan de Jager",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=10547",
  "pages": [
   {
    "text": "I like to read.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/02.mp3"
   },
   {
    "text": "Who can I read to?",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/03.mp3"
   },
   {
    "text": "My sister is asleep.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/04.mp3"
   },
   {
    "text": "Who can I read to?",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/05.mp3"
   },
   {
    "text": "My mother and grandmother are busy.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/06.mp3"
   },
   {
    "text": "Who can I read to?",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/07.mp3"
   },
   {
    "text": "My father and grandfather are busy.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/08.mp3"
   },
   {
    "text": "Who can I read to? I can read to myself!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0087/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0087/mp3/09.mp3"
   }
  ]
 },
 {
  "id": "zama",
  "title": "Zama is great!",
  "author": "Michael Oguttu",
  "art": "Vusi Malindi",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=9984",
  "pages": [
   {
    "text": "My little brother sleeps very late. I wake early, because I am great!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/02.mp3"
   },
   {
    "text": "I am the one who lets in the sun.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/03.mp3"
   },
   {
    "text": "“You’re my morning star,” says Ma.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/04.mp3"
   },
   {
    "text": "I wash myself, I don’t need any help.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/05.mp3"
   },
   {
    "text": "I can cope with cold water and blue smelly soap.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/06.mp3"
   },
   {
    "text": "Ma reminds, “Don’t forget teeth.” I reply, “Never, not me!”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/07.mp3"
   },
   {
    "text": "After washing, I greet Grandpa and Auntie, and wish them a good day.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/08.mp3"
   },
   {
    "text": "Then I dress myself, “I’m big now Ma,” I say.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/09.mp3"
   },
   {
    "text": "I can close my buttons and buckle my shoes.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/10.mp3"
   },
   {
    "text": "And I make sure little brother knows all the school news.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/11.mp3"
   },
   {
    "text": "In class I do my best in every way.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/12.mp3"
   },
   {
    "text": "I do all these good things every day. But the thing I like most, is to play and play!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0095/13.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0095/mp3/13.mp3"
   }
  ]
 },
 {
  "id": "hippos",
  "title": "Why hippos have no hair",
  "author": "Basilio Gimo, David Ker",
  "art": "Carol Liddiment",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=6160",
  "pages": [
   {
    "text": "One day, Rabbit was walking by the riverside.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/02.mp3"
   },
   {
    "text": "Hippo was there too, going for a stroll and eating some nice green grass.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/03.mp3"
   },
   {
    "text": "Hippo didn’t see that Rabbit was there and she accidentally stepped on Rabbit’s foot. Rabbit started screaming at Hippo, “You Hippo! Can’t you see that you’re stepping on my foot?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/04.mp3"
   },
   {
    "text": "Hippo apologised to Rabbit, “I’m so sorry. I didn’t see you. Please forgive me!” But Rabbit wouldn’t listen and he shouted at Hippo, “You did that on purpose! Someday, you’ll see! You’re going to pay!”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/05.mp3"
   },
   {
    "text": "Rabbit went to find Fire and said, “Go, burn Hippo when she comes out of the water to eat grass. She stepped on me!” Fire answered, “No problem, Rabbit, my friend. I’ll do just what you ask.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/06.mp3"
   },
   {
    "text": "Later, Hippo was eating grass far from the river when, “Whoosh!” Fire burst into flame. The flames began to burn Hippo’s hair.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/07.mp3"
   },
   {
    "text": "Hippo started to cry and ran for the water. All her hair was burned off by the fire. Hippo kept crying, “My hair has burned in the fire! My hair is all gone! My beautiful hair!”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/08.mp3"
   },
   {
    "text": "Rabbit was happy that Hippo’s hair was burned. And to this day, for fear of fire, the hippo never goes far from the water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0111/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0111/mp3/09.mp3"
   }
  ]
 },
 {
  "id": "chicken-millipede",
  "title": "Chicken and Millipede",
  "author": "Winny Asara",
  "art": "Magriet Brink",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=9094",
  "pages": [
   {
    "text": "Chicken and Millipede were friends. But they were always competing with each other. One day they decided to play football to see who the best player was.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/02.mp3"
   },
   {
    "text": "They went to the football field and started their game. Chicken was fast, but Millipede was faster. Chicken kicked far, but Millipede kicked further. Chicken started to feel grumpy.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/03.mp3"
   },
   {
    "text": "They decided to play a penalty shoot-out. First Millipede was goal keeper. Chicken scored only one goal. Then it was the chicken’s turn to defend the goal.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/04.mp3"
   },
   {
    "text": "Millipede kicked the ball and scored. Millipede dribbled the ball and scored. Millipede headed the ball and scored. Millipede scored five goals.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/05.mp3"
   },
   {
    "text": "Chicken was furious that she lost. She was a very bad loser. Millipede started laughing because his friend was making such a fuss.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/06.mp3"
   },
   {
    "text": "Chicken was so angry that she opened her beak wide and swallowed the millipede.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/07.mp3"
   },
   {
    "text": "As Chicken was walking home, she met Mother Millipede. Mother Millipede asked, “Have you seen my child?” Chicken didn’t say anything. Mother Millipede was worried.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/08.mp3"
   },
   {
    "text": "Then Mother Millipede heard a tiny voice. “Help me mom!” cried the voice. Mother Millipede looked around and listened carefully. The voice came from inside the chicken.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/09.mp3"
   },
   {
    "text": "Mother Millipede shouted, “Use your special power my child!” Millipedes can make a bad smell and a terrible taste. Chicken began to feel ill.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/10.mp3"
   },
   {
    "text": "Chicken burped. Then she swallowed and spat. Then she sneezed and coughed. And coughed. The millipede was disgusting!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/11.mp3"
   },
   {
    "text": "Chicken coughed until she coughed out the millipede that was in her stomach. Mother Millipede and her child crawled up a tree to hide.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/12.mp3"
   },
   {
    "text": "From that time, chickens and millipedes were enemies.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0141/13.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0141/mp3/13.mp3"
   }
  ]
 },
 {
  "id": "hen-eagle",
  "title": "Hen and Eagle",
  "author": "Ann Nduku",
  "art": "Wiehan de Jager",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=2084",
  "pages": [
   {
    "text": "Once upon a time, Hen and Eagle were friends. They lived in peace with all the other birds. None of them could fly.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/02.mp3"
   },
   {
    "text": "One day, there was famine in the land. Eagle had to walk very far to find food. She came back very tired. “There must be an easier way to travel!” said Eagle.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/03.mp3"
   },
   {
    "text": "After a good night’s sleep, Hen had a brilliant idea. She began collecting the fallen feathers from all their bird friends. “Let’s sew them together on top of our own feathers,” she said. “Perhaps that will make it easier to travel.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/04.mp3"
   },
   {
    "text": "Eagle was the only one in the village with a needle, so she started sewing first. She made herself a pair of beautiful wings and flew high above Hen. Hen borrowed the needle but she soon got tired of sewing. She left the needle on the cupboard and went into the kitchen to prepare food for her children.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/05.mp3"
   },
   {
    "text": "But the other birds had seen Eagle flying away. They asked Hen to lend them the needle to make wings for themselves too. Soon there were birds flying all over the sky.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/06.mp3"
   },
   {
    "text": "When the last bird returned the borrowed needle, Hen was not there. So her children took the needle and started playing with it. When they got tired of the game, they left the needle in the sand.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/07.mp3"
   },
   {
    "text": "Later that afternoon, Eagle returned. She asked for the needle to fix some feathers that had loosened on her journey. Hen looked on the cupboard. She looked in the kitchen. She looked in the yard. But the needle was nowhere to be found.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/08.mp3"
   },
   {
    "text": "“Just give me a day,” Hen begged Eagle. “Then you can fix your wing and fly away to get food again.” “Just one more day,” said Eagle. “If you can’t find the needle, you’ll have to give me one of your chicks as payment.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/09.mp3"
   },
   {
    "text": "When Eagle came the next day, she found Hen scratching in the sand, but no needle. So Eagle flew down very fast and caught one of the chicks. She carried it away. Forever after that, whenever Eagle appears, she finds Hen scratching in the sand for the needle.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/10.mp3"
   },
   {
    "text": "As the shadow of Eagle’s wing falls on the ground, Hen warns her chicks. “Get out of the bare and dry land.” And they respond: “We are not fools. We will run.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0158/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0158/mp3/11.mp3"
   }
  ]
 },
 {
  "id": "vusi",
  "title": "What Vusi's sister said",
  "author": "Nina Orange",
  "art": "Wiehan de Jager",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=6895",
  "pages": [
   {
    "text": "Early one morning Vusi’s granny called him, “Vusi, please take this egg to your parents. They want to make a large cake for your sister’s wedding.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/02.mp3"
   },
   {
    "text": "On his way to his parents, Vusi met two boys picking fruit. One boy grabbed the egg from Vusi and shot it at a tree. The egg broke.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/03.mp3"
   },
   {
    "text": "“What have you done?” cried Vusi. “That egg was for a cake. The cake was for my sister’s wedding. What will my sister say if there is no wedding cake?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/04.mp3"
   },
   {
    "text": "The boys were sorry for teasing Vusi. “We can’t help with the cake, but here is a walking stick for your sister,” said one. Vusi continued on his journey.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/05.mp3"
   },
   {
    "text": "Along the way he met two men building a house. “Can we use that strong stick?” asked one. But the stick was not strong enough for building, and it broke.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/06.mp3"
   },
   {
    "text": "“What have you done?” cried Vusi. “That stick was a gift for my sister. The fruit pickers gave me the stick because they broke the egg for the cake. The cake was for my sister’s wedding. Now there is no egg, no cake, and no gift. What will my sister say?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/07.mp3"
   },
   {
    "text": "The builders were sorry for breaking the stick. “We can’t help with the cake, but here is some thatch for your sister,” said one. And so Vusi continued on his journey.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/08.mp3"
   },
   {
    "text": "Along the way, Vusi met a farmer and a cow. “What delicious thatch, can I have a nibble?” asked the cow. But the thatch was so tasty that the cow ate it all!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/09.mp3"
   },
   {
    "text": "“What have you done?” cried Vusi. “That thatch was a gift for my sister. The builders gave me the thatch because they broke the stick from the fruit pickers. The fruit pickers gave me the stick because they broke the egg for my sister’s cake. The cake was for my sister’s wedding. Now there is no egg, no cake, and no gift. What will my sister say?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/10.mp3"
   },
   {
    "text": "The cow was sorry she was greedy. The farmer agreed that the cow could go with Vusi as a gift for his sister. And so Vusi carried on.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/11.mp3"
   },
   {
    "text": "But the cow ran back to the farmer at supper time. And Vusi got lost on his journey. He arrived very late for his sister’s wedding. The guests were already eating.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/12.mp3"
   },
   {
    "text": "“What shall I do?” cried Vusi. “The cow that ran away was a gift, in return for the thatch the builders gave me. The builders gave me the thatch because they broke the stick from the fruit pickers. The fruit pickers gave me the stick because they broke the egg for the cake. The cake was for the wedding. Now there is no egg, no cake, and no gift.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/13.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/13.mp3"
   },
   {
    "text": "Vusi’s sister thought for a while, then she said, “Vusi my brother, I don’t really care about gifts. I don’t even care about the cake! We are all here together, I am happy. Now put on your smart clothes and let’s celebrate this day!” And so that’s what Vusi did.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0291/14.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0291/mp3/14.mp3"
   }
  ]
 },
 {
  "id": "grandmas-bananas",
  "title": "Grandma's bananas",
  "author": "Ursula Nafula",
  "art": "Catherine Groenewald",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=2094",
  "pages": [
   {
    "text": "Grandma’s garden was wonderful, full of sorghum, millet, and cassava. But best of all were the bananas. Although Grandma had many grandchildren, I secretly knew that I was her favourite. She invited me often to her house. She also told me little secrets. But there was one secret she did not share with me: where she ripened bananas.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/02.mp3"
   },
   {
    "text": "One day I saw a big straw basket placed in the sun outside Grandma’s house. When I asked what it was for, the only answer I got was, “It’s my magic basket.” Next to the basket, there were several banana leaves that Grandma turned from time to time. I was curious. “What are the leaves for, Grandma?” I asked. The only answer I got was, “They are my magic leaves.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/03.mp3"
   },
   {
    "text": "It was so interesting watching Grandma, the bananas, the banana leaves and the big straw basket. But Grandma sent me off to my mother on an errand. “Grandma, please, let me watch as you prepare…” “Don’t be stubborn, child, do as you are told,” she insisted. I took off running.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/04.mp3"
   },
   {
    "text": "When I returned, Grandma was sitting outside but with neither the basket nor the bananas. “Grandma, where is the basket, where are all the bananas, and where…” But the only answer I got was, “They are in my magic place.” It was so disappointing!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/05.mp3"
   },
   {
    "text": "Two days later, Grandma sent me to fetch her walking stick from her bedroom. As soon as I opened the door, I was welcomed by the strong smell of ripening bananas. In the inner room was grandma’s big magic straw basket. It was well hidden by an old blanket. I lifted it and sniffed that glorious smell.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/06.mp3"
   },
   {
    "text": "Grandma’s voice startled me when she called, “What are you doing? Hurry up and bring me the stick.” I hurried out with her walking stick. “What are you smiling about?” Grandma asked. Her question made me realise that I was still smiling at the discovery of her magic place.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/07.mp3"
   },
   {
    "text": "The following day when grandma came to visit my mother, I rushed to her house to check the bananas once more. There was a bunch of very ripe ones. I picked one and hid it in my dress. After covering the basket again, I went behind the house and quickly ate it. It was the sweetest banana I had ever tasted.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/08.mp3"
   },
   {
    "text": "The following day, when grandma was in the garden picking vegetables, I sneaked in and peered at the bananas. Nearly all were ripe. I couldn’t help taking a bunch of four. As I tiptoed towards the door, I heard grandma coughing outside. I just managed to hide the bananas under my dress and walked past her.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/09.mp3"
   },
   {
    "text": "The following day was market day. Grandma woke up early. She always took ripe bananas and cassava to sell at the market. I did not hurry to visit her that day. But I could not avoid her for long.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/10.mp3"
   },
   {
    "text": "Later that evening I was called by my mother and father, and Grandma. I knew why. That night as I lay down to sleep, I knew I could never steal again, not from grandma, not from my parents, and certainly not from anyone else.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0294/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0294/mp3/11.mp3"
   }
  ]
 },
 {
  "id": "tom-bananas",
  "title": "Tom the banana seller",
  "author": "Humphreys Odunga",
  "art": "Zablon Alex Nguku",
  "voice": "Darshan Soni",
  "license": "CC BY 4.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=13627",
  "pages": [
   {
    "text": "Tom carries a tray of ripe bananas.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/02.mp3"
   },
   {
    "text": "Tom goes to the market to sell bananas.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/03.mp3"
   },
   {
    "text": "People at the market are buying fruit.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/04.mp3"
   },
   {
    "text": "But no one is buying Tom’s bananas. They prefer to buy fruit from women.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/05.mp3"
   },
   {
    "text": "“In our community, only women sell fruit,” people say. “What kind of a man is this?” people ask.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/06.mp3"
   },
   {
    "text": "But Tom does not give up. He calls, “Buy my bananas! Buy my sweet ripe bananas!”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/07.mp3"
   },
   {
    "text": "One woman picks up a bunch of bananas from the tray. She looks at the bananas carefully.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/08.mp3"
   },
   {
    "text": "The woman buys the bananas.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/09.mp3"
   },
   {
    "text": "More people come to the stall. They buy Tom’s bananas and eat them.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/10.mp3"
   },
   {
    "text": "Soon, the tray is empty. Tom counts the money he earned.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/11.mp3"
   },
   {
    "text": "Then Tom buys soap, sugar, and bread. He puts the things in his tray.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/12.mp3"
   },
   {
    "text": "Tom balances the tray on his head and goes home.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0296/13.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0296/mp3/13.mp3"
   }
  ]
 },
 {
  "id": "sakima",
  "title": "Sakima's song",
  "author": "Ursula Nafula",
  "art": "Peris Wachuka",
  "voice": "Darshan Soni",
  "license": "CC BY 4.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=13244",
  "pages": [
   {
    "text": "Sakima lived with his parents and his four year old sister. They lived on a rich man’s land. Their grass-thatched hut was at the end of a row of trees.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/02.mp3"
   },
   {
    "text": "When Sakima was three years old, he fell sick and lost his sight. Sakima was a talented boy.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/03.mp3"
   },
   {
    "text": "Sakima did many things that other six year old boys did not do. For example, he could sit with older members of the village and discuss important matters.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/04.mp3"
   },
   {
    "text": "The parents of Sakima worked at the rich man’s house. They left home early in the morning and returned late in the evening. Sakima was left with his little sister.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/05.mp3"
   },
   {
    "text": "Sakima loved to sing songs. One day his mother asked him, “Where do you learn these songs from, Sakima?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/06.mp3"
   },
   {
    "text": "Sakima answered, “They just come, mother. I hear them in my head and then I sing.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/07.mp3"
   },
   {
    "text": "Sakima liked to sing for his little sister, especially, if she felt hungry. His sister would listen to him singing his favourite song. She would sway to the soothing tune.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/08.mp3"
   },
   {
    "text": "“Can you sing it again and again, Sakima,” his sister would beg him. Sakima would accept and sing it over and over again.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/09.mp3"
   },
   {
    "text": "One evening when his parents returned home, they were very quiet. Sakima knew that there was something wrong.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/10.mp3"
   },
   {
    "text": "“What is wrong, mother, father?” Sakima asked. Sakima learned that the rich man’s son was missing. The man was very sad and lonely.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/11.mp3"
   },
   {
    "text": "“I can sing for him. He might be happy again,” Sakima told his parents. But his parents dismissed him. “He is very rich. You are only a blind boy. Do you think your song will help him?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/12.mp3"
   },
   {
    "text": "However, Sakima did not give up. His little sister supported him. She said, “Sakima’s songs soothe me when I am hungry. They will soothe the rich man too.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/13.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/13.mp3"
   },
   {
    "text": "The following day, Sakima asked his little sister to lead him to the rich man’s house.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/14.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/14.mp3"
   },
   {
    "text": "He stood below one big window and began to sing his favourite song. Slowly, the head of the rich man began to show through the big window.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/15.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/15.mp3"
   },
   {
    "text": "The workers stopped what they were doing. They listened to Sakima’s beautiful song. But one man said, “Nobody has been able to console the boss. Does this blind boy think he will console him?”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/16.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/16.mp3"
   },
   {
    "text": "Sakima finished singing his song and turned to leave. But the rich man rushed out and said, “Please sing again.”",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/17.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/17.mp3"
   },
   {
    "text": "At that very moment, two men came carrying someone on a stretcher. They had found the rich man’s son beaten up and left on the side of the road.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/18.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/18.mp3"
   },
   {
    "text": "The rich man was so happy to see his son again. He rewarded Sakima for consoling him. He took his son and Sakima to hospital so Sakima could regain his sight.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0315/19.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0315/mp3/19.mp3"
   }
  ]
 },
 {
  "id": "counting-animals",
  "title": "Counting animals",
  "author": "Zanele Buthelezi, Thembani Dladla, Clare Verbeek",
  "art": "Rob Owen",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=9671",
  "pages": [
   {
    "text": "One elephant is going to drink water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/02.mp3"
   },
   {
    "text": "Two giraffes are going to drink water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/03.mp3"
   },
   {
    "text": "Three buffaloes and four birds are also going to drink water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/04.mp3"
   },
   {
    "text": "Five impalas and six warthogs are walking to the water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/05.mp3"
   },
   {
    "text": "Seven zebras are running to the water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/06.mp3"
   },
   {
    "text": "Eight frogs and nine fish are swimming in the water.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/07.mp3"
   },
   {
    "text": "One lion roars. He also wants to drink. Who is afraid of the lion?",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/08.mp3"
   },
   {
    "text": "One elephant is drinking water with the lion.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0327/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0327/mp3/09.mp3"
   }
  ]
 },
 {
  "id": "children-of-wax",
  "title": "Children of wax",
  "author": "Southern African Folktale",
  "art": "Wiehan de Jager",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=2181",
  "pages": [
   {
    "text": "Once upon a time, there lived a happy family.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/02.mp3"
   },
   {
    "text": "They never fought with each other. They helped their parents at home and in the fields.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/03.mp3"
   },
   {
    "text": "But they were not allowed to go near a fire.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/04.mp3"
   },
   {
    "text": "They had to do all their work during the night. Because they were made of wax!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/05.mp3"
   },
   {
    "text": "But one of the boys longed to go out in the sunlight.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/06.mp3"
   },
   {
    "text": "One day the longing was too strong. His brothers warned him…",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/07.mp3"
   },
   {
    "text": "But it was too late! He melted in the hot sun.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/08.mp3"
   },
   {
    "text": "The wax children were so sad to see their brother melting away.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/09.mp3"
   },
   {
    "text": "But they made a plan. They shaped the lump of melted wax into a bird.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/10.mp3"
   },
   {
    "text": "They took their bird brother up to a high mountain.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/11.mp3"
   },
   {
    "text": "And as the sun rose, he flew away singing into the morning light.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0337/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0337/mp3/12.mp3"
   }
  ]
 },
 {
  "id": "punishment",
  "title": "Punishment",
  "author": "Adelheid Marie Bwire",
  "art": "Melany Pietersen",
  "voice": "Darshan Soni",
  "license": "CC BY 3.0",
  "source": "African Storybook, vía Global Storybooks",
  "url": "https://africanstorybook.org/reader.php?id=11989",
  "pages": [
   {
    "text": "One day, mama got a lot of fruit.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/02.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/02.mp3"
   },
   {
    "text": "“When can we have some fruit?” we ask. “We will have the fruit tonight,” says mama.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/03.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/03.mp3"
   },
   {
    "text": "My brother Rahim is greedy. He tastes all the fruit. He eats a lot of it.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/04.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/04.mp3"
   },
   {
    "text": "“Look at what Rahim did!” shouts my little brother. “Rahim is naughty and selfish,” I say.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/05.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/05.mp3"
   },
   {
    "text": "Mother is angry with Rahim.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/06.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/06.mp3"
   },
   {
    "text": "We are also angry with Rahim. But Rahim is not sorry.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/07.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/07.mp3"
   },
   {
    "text": "“Aren’t you going to punish Rahim?” asks little brother.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/08.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/08.mp3"
   },
   {
    "text": "“Rahim, soon you will be sorry,” warns mama.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/09.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/09.mp3"
   },
   {
    "text": "Rahim starts to feel sick.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/10.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/10.mp3"
   },
   {
    "text": "“My tummy is so sore,” whispers Rahim.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/11.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/11.mp3"
   },
   {
    "text": "Mama knew this would happen. The fruit is punishing Rahim!",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/12.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/12.mp3"
   },
   {
    "text": "Later, Rahim says sorry to us. “I will never be so greedy again,” he promises. And we all believe him.",
    "img": "https://raw.githubusercontent.com/global-asp/gsn-imagebank/master/0342/13.jpg",
    "audio": "https://globalstorybooks.net/media/audio/en/0342/mp3/13.mp3"
   }
  ]
 },
 {
  "id": "shepherds-boy",
  "title": "The Shepherd's Boy And The Wolf",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A Shepherd's Boy was tending his flock near a village, and thought it would be great fun to hoax the villagers by pretending that a Wolf was attacking the sheep: so he shouted out, \"Wolf! wolf!\" and when the people came running up he laughed at them for their pains.",
    "img": null,
    "audio": null
   },
   {
    "text": "He did this more than once, and every time the villagers found they had been hoaxed, for there was no Wolf at all.",
    "img": null,
    "audio": null
   },
   {
    "text": "At last a Wolf really did come, and the Boy cried, \"Wolf! wolf!\" as loud as he could: but the people were so used to hearing him call that they took no notice of his cries for help.",
    "img": null,
    "audio": null
   },
   {
    "text": "And so the Wolf had it all his own way, and killed off sheep after sheep at his leisure.",
    "img": null,
    "audio": null
   },
   {
    "text": "You cannot believe a liar even when he tells the truth.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "lion-mouse",
  "title": "The Lion And The Mouse",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A Lion asleep in his lair was waked up by a Mouse running over his face. Losing his temper he seized it with his paw and was about to kill it.",
    "img": null,
    "audio": null
   },
   {
    "text": "The Mouse, terrified, piteously entreated him to spare its life. \"Please let me go,\" it cried, \"and one day I will repay you for your kindness.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The idea of so insignificant a creature ever being able to do anything for him amused the Lion so much that he laughed aloud, and good-humouredly let it go.",
    "img": null,
    "audio": null
   },
   {
    "text": "But the Mouse's chance came, after all.",
    "img": null,
    "audio": null
   },
   {
    "text": "One day the Lion got entangled in a net which had been spread for game by some hunters, and the Mouse heard and recognised his roars of anger and ran to the spot.",
    "img": null,
    "audio": null
   },
   {
    "text": "Without more ado it set to work to gnaw the ropes with its teeth, and succeeded before long in setting the Lion free.",
    "img": null,
    "audio": null
   },
   {
    "text": "\"There!\" said the Mouse, \"you laughed at me when I promised I would repay you: but now you see, even a Mouse can help a Lion.\"",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "grasshopper-ants",
  "title": "The Grasshopper And The Ants",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "One fine day in winter some Ants were busy drying their store of corn, which had got rather damp during a long spell of rain.",
    "img": null,
    "audio": null
   },
   {
    "text": "Presently up came a Grasshopper and begged them to spare her a few grains, \"For,\" she said, \"I'm simply starving.\" The Ants stopped work for a moment, though this was against their principles.",
    "img": null,
    "audio": null
   },
   {
    "text": "\"May we ask,\" said they, \"what you were doing with yourself all last summer? Why didn't you collect a store of food for the winter?\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"The fact is,\" replied the Grasshopper, \"I was so busy singing that I hadn't the time.\" \"If you spent the summer singing,\" replied the Ants, \"you can't do better than spend the winter dancing.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "And they chuckled and went on with their work.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "golden-eggs",
  "title": "The Goose That Laid The Golden Eggs",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A Man and his Wife had the good fortune to possess a Goose which laid a Golden Egg every day.",
    "img": null,
    "audio": null
   },
   {
    "text": "Lucky though they were, they soon began to think they were not getting rich fast enough, and, imagining the bird must be made of gold inside, they decided to kill it in order to secure the whole store of precious metal at once.",
    "img": null,
    "audio": null
   },
   {
    "text": "But when they cut it open they found it was just like any other goose.",
    "img": null,
    "audio": null
   },
   {
    "text": "Thus, they neither got rich all at once, as they had hoped, nor enjoyed any longer the daily addition to their wealth.",
    "img": null,
    "audio": null
   },
   {
    "text": "Much wants more and loses all.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "north-wind",
  "title": "The North Wind And The Sun",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A dispute arose between the North Wind and the Sun, each claiming that he was stronger than the other.",
    "img": null,
    "audio": null
   },
   {
    "text": "At last they agreed to try their powers upon a traveller, to see which could soonest strip him of his cloak.",
    "img": null,
    "audio": null
   },
   {
    "text": "The North Wind had the first try; and, gathering up all his force for the attack, he came whirling furiously down upon the man, and caught up his cloak as though he would wrest it from him by one single effort: but the harder he blew, the more closely the man wrapped it round himself.",
    "img": null,
    "audio": null
   },
   {
    "text": "Then came the turn of the Sun.",
    "img": null,
    "audio": null
   },
   {
    "text": "At first he beamed gently upon the traveller, who soon unclasped his cloak and walked on with it hanging loosely about his shoulders: then he shone forth in his full strength, and the man, before he had gone many steps, was glad to throw his cloak right off and complete his journey more lightly clad.",
    "img": null,
    "audio": null
   },
   {
    "text": "Persuasion is better than force",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "milkmaid",
  "title": "The Milkmaid And Her Pail",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A farmer's daughter had been out to milk the cows, and was returning to the dairy carrying her pail of milk upon her head. As she walked along, she fell a-musing after this fashion:",
    "img": null,
    "audio": null
   },
   {
    "text": "\"The milk in this pail will provide me with cream, which I will make into butter and take to market to sell.",
    "img": null,
    "audio": null
   },
   {
    "text": "With the money I will buy a number of eggs, and these, when hatched, will produce chickens, and by and by I shall have quite a large poultry-yard.",
    "img": null,
    "audio": null
   },
   {
    "text": "Then I shall sell some of my fowls, and with the money which they will bring in I will buy myself a new gown, which I shall wear when I go to the fair; and all the young fellows will admire it, and come and make love to me, but I shall toss my head and have nothing to say to them.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "Forgetting all about the pail, and suiting the action to the word, she tossed her head.",
    "img": null,
    "audio": null
   },
   {
    "text": "Down went the pail, all the milk was spilled, and all her fine castles in the air vanished in a moment!",
    "img": null,
    "audio": null
   },
   {
    "text": "Do not count your chickens before they are hatched.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "town-mouse",
  "title": "The Town Mouse And The Country Mouse",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A Town Mouse and a Country Mouse were acquaintances, and the Country Mouse one day invited his friend to come and see him at his home in the fields.",
    "img": null,
    "audio": null
   },
   {
    "text": "The Town Mouse came, and they sat down to a dinner of barleycorns and roots, the latter of which had a distinctly earthy flavour.",
    "img": null,
    "audio": null
   },
   {
    "text": "The fare was not much to the taste of the guest, and presently he broke out with \"My poor dear friend, you live here no better than the ants.",
    "img": null,
    "audio": null
   },
   {
    "text": "Now, you should just see how I fare! My larder is a regular horn of plenty.",
    "img": null,
    "audio": null
   },
   {
    "text": "You must come and stay with me, and I promise you you shall live on the fat of the land.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "So when he returned to town he took the Country Mouse with him, and showed him into a larder containing flour and oatmeal and figs and honey and dates.",
    "img": null,
    "audio": null
   },
   {
    "text": "The Country Mouse had never seen anything like it, and sat down to enjoy the luxuries his friend provided: but before they had well begun, the door of the larder opened and some one came in.",
    "img": null,
    "audio": null
   },
   {
    "text": "The two Mice scampered off and hid themselves in a narrow and exceedingly uncomfortable hole. Presently, when all was quiet, they ventured out again; but some one else came in, and off they scuttled again.",
    "img": null,
    "audio": null
   },
   {
    "text": "This was too much for the visitor. \"Good-bye,\" said he, \"I'm off.",
    "img": null,
    "audio": null
   },
   {
    "text": "You live in the lap of luxury, I can see, but you are surrounded by dangers; whereas at home I can enjoy my simple dinner of roots and corn in peace.\"",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "dog-shadow",
  "title": "The Dog And The Shadow",
  "author": "Esopo (traducción de V. S. Vernon Jones, 1912)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Aesop's Fables, #11339)",
  "url": "https://www.gutenberg.org/ebooks/11339",
  "pages": [
   {
    "text": "A Dog was crossing a plank bridge over a stream with a piece of meat in his mouth, when he happened to see his own reflection in the water.",
    "img": null,
    "audio": null
   },
   {
    "text": "He thought it was another dog with a piece of meat twice as big; so he let go his own, and flew at the other dog to get the larger piece.",
    "img": null,
    "audio": null
   },
   {
    "text": "But, of course, all that happened was that he got neither; for one was only a shadow, and the other was carried away by the current.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "after-twenty-years",
  "title": "After Twenty Years",
  "author": "O. Henry",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (The Four Million, #2776)",
  "url": "https://www.gutenberg.org/ebooks/2776",
  "pages": [
   {
    "text": "The policeman on the beat moved up the avenue impressively. The impressiveness was habitual and not for show, for spectators were few. The time was barely 10 o'clock at night, but chilly gusts of wind with a taste of rain in them had well nigh de-peopled the streets. Trying doors as he went, twirling his club with many intricate and artful movements, turning now and then to cast his watchful eye adown the pacific thoroughfare, the officer, with his stalwart form and slight swagger, made a fine picture of a guardian of the peace. The vicinity was one that kept early hours. Now and then you might see the lights of a cigar store or of an all-night lunch counter; but the majority of the doors belonged to business places that had long since been closed.",
    "img": null,
    "audio": null
   },
   {
    "text": "When about midway of a certain block the policeman suddenly slowed his walk. In the doorway of a darkened hardware store a man leaned, with an unlighted cigar in his mouth. As the policeman walked up to him the man spoke up quickly. \"It's all right, officer,\" he said, reassuringly. \"I'm just waiting for a friend. It's an appointment made twenty years ago. Sounds a little funny to you, doesn't it? Well, I'll explain if you'd like to make certain it's all straight. About that long ago there used to be a restaurant where this store stands--'Big Joe' Brady's restaurant.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Until five years ago,\" said the policeman. \"It was torn down then.\" The man in the doorway struck a match and lit his cigar. The light showed a pale, square-jawed face with keen eyes, and a little white scar near his right eyebrow. His scarfpin was a large diamond, oddly set.",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Twenty years ago to-night,\" said the man, \"I dined here at 'Big Joe' Brady's with Jimmy Wells, my best chum, and the finest chap in the world. He and I were raised here in New York, just like two brothers, together. I was eighteen and Jimmy was twenty. The next morning I was to start for the West to make my fortune. You couldn't have dragged Jimmy out of New York; he thought it was the only place on earth. Well, we agreed that night that we would meet here again exactly twenty years from that date and time, no matter what our conditions might be or from what distance we might have to come. We figured that in twenty years each of us ought to have our destiny worked out and our fortunes made, whatever they were going to be.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"It sounds pretty interesting,\" said the policeman. \"Rather a long time between meets, though, it seems to me. Haven't you heard from your friend since you left?\" \"Well, yes, for a time we corresponded,\" said the other. \"But after a year or two we lost track of each other. You see, the West is a pretty big proposition, and I kept hustling around over it pretty lively. But I know Jimmy will meet me here if he's alive, for he always was the truest, stanchest old chap in the world. He'll never forget. I came a thousand miles to stand in this door to-night, and it's worth it if my old partner turns up.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The waiting man pulled out a handsome watch, the lids of it set with small diamonds. \"Three minutes to ten,\" he announced. \"It was exactly ten o'clock when we parted here at the restaurant door.\" \"Did pretty well out West, didn't you?\" asked the policeman. \"You bet! I hope Jimmy has done half as well. He was a kind of plodder, though, good fellow as he was. I've had to compete with some of the sharpest wits going to get my pile. A man gets in a groove in New York. It takes the West to put a razor-edge on him.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The policeman twirled his club and took a step or two. \"I'll be on my way. Hope your friend comes around all right. Going to call time on him sharp?\" \"I should say not!\" said the other. \"I'll give him half an hour at least. If Jimmy is alive on earth he'll be here by that time. So long, officer.\" \"Good-night, sir,\" said the policeman, passing on along his beat, trying doors as he went.",
    "img": null,
    "audio": null
   },
   {
    "text": "There was now a fine, cold drizzle falling, and the wind had risen from its uncertain puffs into a steady blow. The few foot passengers astir in that quarter hurried dismally and silently along with coat collars turned high and pocketed hands. And in the door of the hardware store the man who had come a thousand miles to fill an appointment, uncertain almost to absurdity, with the friend of his youth, smoked his cigar and waited. About twenty minutes he waited, and then a tall man in a long overcoat, with collar turned up to his ears, hurried across from the opposite side of the street. He went directly to the waiting man.",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Is that you, Bob?\" he asked, doubtfully. \"Is that you, Jimmy Wells?\" cried the man in the door. \"Bless my heart!\" exclaimed the new arrival, grasping both the other's hands with his own. \"It's Bob, sure as fate. I was certain I'd find you here if you were still in existence. Well, well, well!--twenty years is a long time. The old restaurant's gone, Bob; I wish it had lasted, so we could have had another dinner there. How has the West treated you, old man?\" \"Bully; it has given me everything I asked it for. You've changed lots, Jimmy. I never thought you were so tall by two or three inches.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Oh, I grew a bit after I was twenty.\" \"Doing well in New York, Jimmy?\" \"Moderately. I have a position in one of the city departments. Come on, Bob; we'll go around to a place I know of, and have a good long talk about old times.\" The two men started up the street, arm in arm. The man from the West, his egotism enlarged by success, was beginning to outline the history of his career. The other, submerged in his overcoat, listened with interest. At the corner stood a drug store, brilliant with electric lights. When they came into this glare each of them turned simultaneously to gaze upon the other's face.",
    "img": null,
    "audio": null
   },
   {
    "text": "The man from the West stopped suddenly and released his arm. \"You're not Jimmy Wells,\" he snapped. \"Twenty years is a long time, but not long enough to change a man's nose from a Roman to a pug.\" \"It sometimes changes a good man into a bad one,\" said the tall man. \"You've been under arrest for ten minutes, 'Silky' Bob. Chicago thinks you may have dropped over our way and wires us she wants to have a chat with you. Going quietly, are you? That's sensible. Now, before we go on to the station here's a note I was asked to hand you. You may read it here at the window. It's from Patrolman Wells.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The man from the West unfolded the little piece of paper handed him. His hand was steady when he began to read, but it trembled a little by the time he had finished. The note was rather short. \"Bob: I was at the appointed place on time. When you struck the match to light your cigar I saw it was the face of the man wanted in Chicago. Somehow I couldn't do it myself, so I went around and got a plain clothes man to do the job. JIMMY.\"",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "gift-of-the-magi",
  "title": "The Gift of the Magi",
  "author": "O. Henry",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (The Four Million, #2776)",
  "url": "https://www.gutenberg.org/ebooks/2776",
  "pages": [
   {
    "text": "One dollar and eighty-seven cents. That was all. And sixty cents of it was in pennies. Pennies saved one and two at a time by bulldozing the grocer and the vegetable man and the butcher until one's cheeks burned with the silent imputation of parsimony that such close dealing implied. Three times Della counted it. One dollar and eighty-seven cents. And the next day would be Christmas. There was clearly nothing to do but flop down on the shabby little couch and howl. So Della did it. Which instigates the moral reflection that life is made up of sobs, sniffles, and smiles, with sniffles predominating.",
    "img": null,
    "audio": null
   },
   {
    "text": "While the mistress of the home is gradually subsiding from the first stage to the second, take a look at the home. A furnished flat at $8 per week. It did not exactly beggar description, but it certainly had that word on the lookout for the mendicancy squad.",
    "img": null,
    "audio": null
   },
   {
    "text": "In the vestibule below was a letter-box into which no letter would go, and an electric button from which no mortal finger could coax a ring. Also appertaining thereunto was a card bearing the name \"Mr. James Dillingham Young.\" The \"Dillingham\" had been flung to the breeze during a former period of prosperity when its possessor was being paid $30 per week. Now, when the income was shrunk to $20, the letters of \"Dillingham\" looked blurred, as though they were thinking seriously of contracting to a modest and unassuming D. But whenever Mr. James Dillingham Young came home and reached his flat above he was called \"Jim\" and greatly hugged by Mrs. James Dillingham Young, already introduced to you as Della. Which is all very good.",
    "img": null,
    "audio": null
   },
   {
    "text": "Della finished her cry and attended to her cheeks with the powder rag. She stood by the window and looked out dully at a grey cat walking a grey fence in a grey backyard. Tomorrow would be Christmas Day, and she had only $1.87 with which to buy Jim a present. She had been saving every penny she could for months, with this result. Twenty dollars a week doesn't go far. Expenses had been greater than she had calculated. They always are. Only $1.87 to buy a present for Jim. Her Jim. Many a happy hour she had spent planning for something nice for him. Something fine and rare and sterling--something just a little bit near to being worthy of the honour of being owned by Jim.",
    "img": null,
    "audio": null
   },
   {
    "text": "There was a pier-glass between the windows of the room. Perhaps you have seen a pier-glass in an $8 flat. A very thin and very agile person may, by observing his reflection in a rapid sequence of longitudinal strips, obtain a fairly accurate conception of his looks. Della, being slender, had mastered the art. Suddenly she whirled from the window and stood before the glass. Her eyes were shining brilliantly, but her face had lost its colour within twenty seconds. Rapidly she pulled down her hair and let it fall to its full length.",
    "img": null,
    "audio": null
   },
   {
    "text": "Now, there were two possessions of the James Dillingham Youngs in which they both took a mighty pride. One was Jim's gold watch that had been his father's and his grandfather's. The other was Della's hair. Had the Queen of Sheba lived in the flat across the airshaft, Della would have let her hair hang out the window some day to dry just to depreciate Her Majesty's jewels and gifts. Had King Solomon been the janitor, with all his treasures piled up in the basement, Jim would have pulled out his watch every time he passed, just to see him pluck at his beard from envy.",
    "img": null,
    "audio": null
   },
   {
    "text": "So now Della's beautiful hair fell about her, rippling and shining like a cascade of brown waters. It reached below her knee and made itself almost a garment for her. And then she did it up again nervously and quickly. Once she faltered for a minute and stood still while a tear or two splashed on the worn red carpet. On went her old brown jacket; on went her old brown hat. With a whirl of skirts and with the brilliant sparkle still in her eyes, she fluttered out the door and down the stairs to the street.",
    "img": null,
    "audio": null
   },
   {
    "text": "Where she stopped the sign read: \"Mme. Sofronie. Hair Goods of All Kinds.\" One flight up Della ran, and collected herself, panting. Madame, large, too white, chilly, hardly looked the \"Sofronie.\" \"Will you buy my hair?\" asked Della. \"I buy hair,\" said Madame. \"Take yer hat off and let's have a sight at the looks of it.\" Down rippled the brown cascade. \"Twenty dollars,\" said Madame, lifting the mass with a practised hand. \"Give it to me quick,\" said Della. Oh, and the next two hours tripped by on rosy wings. Forget the hashed metaphor. She was ransacking the stores for Jim's present.",
    "img": null,
    "audio": null
   },
   {
    "text": "She found it at last. It surely had been made for Jim and no one else. There was no other like it in any of the stores, and she had turned all of them inside out. It was a platinum fob chain simple and chaste in design, properly proclaiming its value by substance alone and not by meretricious ornamentation--as all good things should do. It was even worthy of The Watch. As soon as she saw it she knew that it must be Jim's. It was like him. Quietness and value--the description applied to both. Twenty-one dollars they took from her for it, and she hurried home with the 87 cents. With that chain on his watch Jim might be properly anxious about the time in any company. Grand as the watch was, he sometimes looked at it on the sly on account of the old leather strap that he used in place of a chain.",
    "img": null,
    "audio": null
   },
   {
    "text": "When Della reached home her intoxication gave way a little to prudence and reason. She got out her curling irons and lighted the gas and went to work repairing the ravages made by generosity added to love. Which is always a tremendous task, dear friends--a mammoth task. Within forty minutes her head was covered with tiny, close-lying curls that made her look wonderfully like a truant schoolboy. She looked at her reflection in the mirror long, carefully, and critically. \"If Jim doesn't kill me,\" she said to herself, \"before he takes a second look at me, he'll say I look like a Coney Island chorus girl. But what could I do--oh! what could I do with a dollar and eighty-seven cents?\"",
    "img": null,
    "audio": null
   },
   {
    "text": "At 7 o'clock the coffee was made and the frying-pan was on the back of the stove hot and ready to cook the chops. Jim was never late. Della doubled the fob chain in her hand and sat on the corner of the table near the door that he always entered. Then she heard his step on the stair away down on the first flight, and she turned white for just a moment. She had a habit for saying little silent prayers about the simplest everyday things, and now she whispered: \"Please God, make him think I am still pretty.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The door opened and Jim stepped in and closed it. He looked thin and very serious. Poor fellow, he was only twenty-two--and to be burdened with a family! He needed a new overcoat and he was without gloves. Jim stopped inside the door, as immovable as a setter at the scent of quail. His eyes were fixed upon Della, and there was an expression in them that she could not read, and it terrified her. It was not anger, nor surprise, nor disapproval, nor horror, nor any of the sentiments that she had been prepared for. He simply stared at her fixedly with that peculiar expression on his face.",
    "img": null,
    "audio": null
   },
   {
    "text": "Della wriggled off the table and went for him. \"Jim, darling,\" she cried, \"don't look at me that way. I had my hair cut off and sold because I couldn't have lived through Christmas without giving you a present. It'll grow out again--you won't mind, will you? I just had to do it. My hair grows awfully fast. Say 'Merry Christmas!' Jim, and let's be happy. You don't know what a nice--what a beautiful, nice gift I've got for you.\" \"You've cut off your hair?\" asked Jim, laboriously, as if he had not arrived at that patent fact yet even after the hardest mental labor.",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Cut it off and sold it,\" said Della. \"Don't you like me just as well, anyhow? I'm me without my hair, ain't I?\" Jim looked about the room curiously. \"You say your hair is gone?\" he said, with an air almost of idiocy. \"You needn't look for it,\" said Della. \"It's sold, I tell you--sold and gone, too. It's Christmas Eve, boy. Be good to me, for it went for you. Maybe the hairs of my head were numbered,\" she went on with sudden serious sweetness, \"but nobody could ever count my love for you. Shall I put the chops on, Jim?\"",
    "img": null,
    "audio": null
   },
   {
    "text": "Out of his trance Jim seemed quickly to wake. He enfolded his Della. For ten seconds let us regard with discreet scrutiny some inconsequential object in the other direction. Eight dollars a week or a million a year--what is the difference? A mathematician or a wit would give you the wrong answer. The magi brought valuable gifts, but that was not among them. This dark assertion will be illuminated later on. Jim drew a package from his overcoat pocket and threw it upon the table. \"Don't make any mistake, Dell,\" he said, \"about me. I don't think there's anything in the way of a haircut or a shave or a shampoo that could make me like my girl any less. But if you'll unwrap that package you may see why you had me going a while at first.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "White fingers and nimble tore at the string and paper. And then an ecstatic scream of joy; and then, alas! a quick feminine change to hysterical tears and wails, necessitating the immediate employment of all the comforting powers of the lord of the flat. For there lay The Combs--the set of combs, side and back, that Della had worshipped long in a Broadway window. Beautiful combs, pure tortoise shell, with jewelled rims--just the shade to wear in the beautiful vanished hair. They were expensive combs, she knew, and her heart had simply craved and yearned over them without the least hope of possession. And now, they were hers, but the tresses that should have adorned the coveted adornments were gone.",
    "img": null,
    "audio": null
   },
   {
    "text": "But she hugged them to her bosom, and at length she was able to look up with dim eyes and a smile and say: \"My hair grows so fast, Jim!\" And then Della leaped up like a little singed cat and cried, \"Oh, oh!\" Jim had not yet seen his beautiful present. She held it out to him eagerly upon her open palm. The dull precious metal seemed to flash with a reflection of her bright and ardent spirit. \"Isn't it a dandy, Jim? I hunted all over town to find it. You'll have to look at the time a hundred times a day now. Give me your watch. I want to see how it looks on it.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "Instead of obeying, Jim tumbled down on the couch and put his hands under the back of his head and smiled. \"Dell,\" said he, \"let's put our Christmas presents away and keep 'em a while. They're too nice to use just at present. I sold the watch to get the money to buy your combs. And now suppose you put the chops on.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The magi, as you know, were wise men--wonderfully wise men--who brought gifts to the Babe in the manger. They invented the art of giving Christmas presents. Being wise, their gifts were no doubt wise ones, possibly bearing the privilege of exchange in case of duplication. And here I have lamely related to you the uneventful chronicle of two foolish children in a flat who most unwisely sacrificed for each other the greatest treasures of their house. But in a last word to the wise of these days let it be said that of all who give gifts these two were the wisest. Of all who give and receive gifts, such as they are wisest. Everywhere they are wisest. They are the magi.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "hearts-and-hands",
  "title": "Hearts and Hands",
  "author": "O. Henry",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Waifs and Strays, #2295)",
  "url": "https://www.gutenberg.org/ebooks/2295",
  "pages": [
   {
    "text": "At Denver there was an influx of passengers into the coaches on the eastbound B. & M. express. In one coach there sat a very pretty young woman dressed in elegant taste and surrounded by all the luxurious comforts of an experienced traveler. Among the newcomers were two young men, one of handsome presence with a bold, frank countenance and manner; the other a ruffled, glum-faced person, heavily built and roughly dressed. The two were handcuffed together.",
    "img": null,
    "audio": null
   },
   {
    "text": "As they passed down the aisle of the coach the only vacant seat offered was a reversed one facing the attractive young woman. Here the linked couple seated themselves. The young woman's glance fell upon them with a distant, swift disinterest; then with a lovely smile brightening her countenance and a tender pink tingeing her rounded cheeks, she held out a little gray-gloved hand. When she spoke her voice, full, sweet, and deliberate, proclaimed that its owner was accustomed to speak and be heard. \"Well, Mr. Easton, if you will make me speak first, I suppose I must. Don't you ever recognize old friends when you meet them in the West?\"",
    "img": null,
    "audio": null
   },
   {
    "text": "The younger man roused himself sharply at the sound of her voice, seemed to struggle with a slight embarrassment which he threw off instantly, and then clasped her fingers with his left hand. \"It's Miss Fairchild,\" he said, with a smile. \"I'll ask you to excuse the other hand; it's otherwise engaged just at present.\" He slightly raised his right hand, bound at the wrist by the shining \"bracelet\" to the left one of his companion. The glad look in the girl's eyes slowly changed to a bewildered horror. The glow faded from her cheeks. Her lips parted in a vague, relaxing distress. Easton, with a little laugh, as if amused, was about to speak again when the other forestalled him. The glum-faced man had been watching the girl's countenance with veiled glances from his keen, shrewd eyes.",
    "img": null,
    "audio": null
   },
   {
    "text": "\"You'll excuse me for speaking, miss, but, I see you're acquainted with the marshall here. If you'll ask him to speak a word for me when we get to the pen he'll do it, and it'll make things easier for me there. He's taking me to Leavenworth prison. It's seven years for counterfeiting.\" \"Oh!\" said the girl, with a deep breath and returning color. \"So that is what you are doing out here? A marshal!\" \"My dear Miss Fairchild,\" said Easton, calmly, \"I had to do something. Money has a way of taking wings unto itself, and you know it takes money to keep step with our crowd in Washington. I saw this opening in the West, and--well, a marshalship isn't quite as high a position as that of ambassador, but--\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"The ambassador,\" said the girl, warmly, \"doesn't call any more. He needn't ever have done so. You ought to know that. And so now you are one of these dashing Western heroes, and you ride and shoot and go into all kinds of dangers. That's different from the Washington life. You have been missed from the old crowd.\" The girl's eyes, fascinated, went back, widening a little, to rest upon the glittering handcuffs. \"Don't you worry about them, miss,\" said the other man. \"All marshals handcuff themselves to their prisoners to keep them from getting away. Mr. Easton knows his business.\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Will we see you again soon in Washington?\" asked the girl. \"Not soon, I think,\" said Easton. \"My butterfly days are over, I fear.\" \"I love the West,\" said the girl irrelevantly. Her eyes were shining softly. She looked away out the car window. She began to speak truly and simply without the gloss of style and manner: \"Mamma and I spent the summer in Denver. She went home a week ago because father was slightly ill. I could live and be happy in the West. I think the air here agrees with me. Money isn't everything. But people always misunderstand things and remain stupid--\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Say, Mr. Marshal,\" growled the glum-faced man. \"This isn't quite fair. I'm needing a drink, and haven't had a smoke all day. Haven't you talked long enough? Take me in the smoker now, won't you? I'm half dead for a pipe.\" The bound travelers rose to their feet, Easton with the same slow smile on his face. \"I can't deny a petition for tobacco,\" he said, lightly. \"It's the one friend of the unfortunate. Good-bye, Miss Fairchild. Duty calls, you know.\" He held out his hand for a farewell. \"It's too bad you are not going East,\" she said, reclothing herself with manner and style. \"But you must go on to Leavenworth, I suppose?\"",
    "img": null,
    "audio": null
   },
   {
    "text": "\"Yes,\" said Easton, \"I must go on to Leavenworth.\" The two men sidled down the aisle into the smoker. The two passengers in a seat near by had heard most of the conversation. Said one of them: \"That marshal's a good sort of chap. Some of these Western fellows are all right.\" \"Pretty young to hold an office like that, isn't he?\" asked the other. \"Young!\" exclaimed the first speaker, \"why--Oh! didn't you catch on? Say--did you ever know an officer to handcuff a prisoner to his right hand?\"",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "open-window",
  "title": "The Open Window",
  "author": "Saki (H. H. Munro)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Beasts and Super-Beasts, #269)",
  "url": "https://www.gutenberg.org/ebooks/269",
  "pages": [
   {
    "text": "“My aunt will be down presently, Mr. Nuttel,” said a very self-possessed young lady of fifteen; “in the meantime you must try and put up with me.” Framton Nuttel endeavoured to say the correct something which should duly flatter the niece of the moment without unduly discounting the aunt that was to come. Privately he doubted more than ever whether these formal visits on a succession of total strangers would do much towards helping the nerve cure which he was supposed to be undergoing.",
    "img": null,
    "audio": null
   },
   {
    "text": "“I know how it will be,” his sister had said when he was preparing to migrate to this rural retreat; “you will bury yourself down there and not speak to a living soul, and your nerves will be worse than ever from moping. I shall just give you letters of introduction to all the people I know there. Some of them, as far as I can remember, were quite nice.” Framton wondered whether Mrs. Sappleton, the lady to whom he was presenting one of the letters of introduction, came into the nice division.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Do you know many of the people round here?” asked the niece, when she judged that they had had sufficient silent communion. “Hardly a soul,” said Framton. “My sister was staying here, at the rectory, you know, some four years ago, and she gave me letters of introduction to some of the people here.” He made the last statement in a tone of distinct regret. “Then you know practically nothing about my aunt?” pursued the self-possessed young lady. “Only her name and address,” admitted the caller. He was wondering whether Mrs. Sappleton was in the married or widowed state. An undefinable something about the room seemed to suggest masculine habitation.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Her great tragedy happened just three years ago,” said the child; “that would be since your sister’s time.” “Her tragedy?” asked Framton; somehow in this restful country spot tragedies seemed out of place. “You may wonder why we keep that window wide open on an October afternoon,” said the niece, indicating a large French window that opened on to a lawn. “It is quite warm for the time of the year,” said Framton; “but has that window got anything to do with the tragedy?” “Out through that window, three years ago to a day, her husband and her two young brothers went off for their day’s shooting. They never came back. In crossing the moor to their favourite snipe-shooting ground they were all three engulfed in a treacherous piece of bog.",
    "img": null,
    "audio": null
   },
   {
    "text": "It had been that dreadful wet summer, you know, and places that were safe in other years gave way suddenly without warning. Their bodies were never recovered. That was the dreadful part of it.” Here the child’s voice lost its self-possessed note and became falteringly human. “Poor aunt always thinks that they will come back some day, they and the little brown spaniel that was lost with them, and walk in at that window just as they used to do. That is why the window is kept open every evening till it is quite dusk. Poor dear aunt, she has often told me how they went out, her husband with his white waterproof coat over his arm, and Ronnie, her youngest brother, singing ‘Bertie, why do you bound?’ as he always did to tease her, because she said it got on her nerves.",
    "img": null,
    "audio": null
   },
   {
    "text": "Do you know, sometimes on still, quiet evenings like this, I almost get a creepy feeling that they will all walk in through that window—” She broke off with a little shudder. It was a relief to Framton when the aunt bustled into the room with a whirl of apologies for being late in making her appearance. “I hope Vera has been amusing you?” she said. “She has been very interesting,” said Framton. “I hope you don’t mind the open window,” said Mrs. Sappleton briskly; “my husband and brothers will be home directly from shooting, and they always come in this way. They’ve been out for snipe in the marshes to-day, so they’ll make a fine mess over my poor carpets. So like you men-folk, isn’t it?”",
    "img": null,
    "audio": null
   },
   {
    "text": "She rattled on cheerfully about the shooting and the scarcity of birds, and the prospects for duck in the winter. To Framton it was all purely horrible. He made a desperate but only partially successful effort to turn the talk on to a less ghastly topic; he was conscious that his hostess was giving him only a fragment of her attention, and her eyes were constantly straying past him to the open window and the lawn beyond. It was certainly an unfortunate coincidence that he should have paid his visit on this tragic anniversary.",
    "img": null,
    "audio": null
   },
   {
    "text": "“The doctors agree in ordering me complete rest, an absence of mental excitement, and avoidance of anything in the nature of violent physical exercise,” announced Framton, who laboured under the tolerably widespread delusion that total strangers and chance acquaintances are hungry for the least detail of one’s ailments and infirmities, their cause and cure. “On the matter of diet they are not so much in agreement,” he continued. “No?” said Mrs. Sappleton, in a voice which only replaced a yawn at the last moment. Then she suddenly brightened into alert attention—but not to what Framton was saying.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Here they are at last!” she cried. “Just in time for tea, and don’t they look as if they were muddy up to the eyes!” Framton shivered slightly and turned towards the niece with a look intended to convey sympathetic comprehension. The child was staring out through the open window with dazed horror in her eyes. In a chill shock of nameless fear Framton swung round in his seat and looked in the same direction. In the deepening twilight three figures were walking across the lawn towards the window; they all carried guns under their arms, and one of them was additionally burdened with a white coat hung over his shoulders. A tired brown spaniel kept close at their heels. Noiselessly they neared the house, and then a hoarse young voice chanted out of the dusk: “I said, Bertie, why do you bound?”",
    "img": null,
    "audio": null
   },
   {
    "text": "Framton grabbed wildly at his stick and hat; the hall-door, the gravel-drive, and the front gate were dimly-noted stages in his headlong retreat. A cyclist coming along the road had to run into the hedge to avoid an imminent collision. “Here we are, my dear,” said the bearer of the white mackintosh, coming in through the window; “fairly muddy, but most of it’s dry. Who was that who bolted out as we came up?” “A most extraordinary man, a Mr. Nuttel,” said Mrs. Sappleton; “could only talk about his illnesses, and dashed off without a word of good-bye or apology when you arrived. One would think he had seen a ghost.”",
    "img": null,
    "audio": null
   },
   {
    "text": "“I expect it was the spaniel,” said the niece calmly; “he told me he had a horror of dogs. He was once hunted into a cemetery somewhere on the banks of the Ganges by a pack of pariah dogs, and had to spend the night in a newly dug grave with the creatures snarling and grinning and foaming just above him. Enough to make anyone lose their nerve.” Romance at short notice was her speciality.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "lumber-room",
  "title": "The Lumber-Room",
  "author": "Saki (H. H. Munro)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Beasts and Super-Beasts, #269)",
  "url": "https://www.gutenberg.org/ebooks/269",
  "pages": [
   {
    "text": "The children were to be driven, as a special treat, to the sands at Jagborough. Nicholas was not to be of the party; he was in disgrace. Only that morning he had refused to eat his wholesome bread-and-milk on the seemingly frivolous ground that there was a frog in it. Older and wiser and better people had told him that there could not possibly be a frog in his bread-and-milk and that he was not to talk nonsense; he continued, nevertheless, to talk what seemed the veriest nonsense, and described with much detail the colouration and markings of the alleged frog. The dramatic part of the incident was that there really was a frog in Nicholas’ basin of bread-and-milk; he had put it there himself, so he felt entitled to know something about it. The sin of taking a frog from the garden and putting it into a bowl of wholesome bread-and-milk was enlarged on at great length, but the fact that stood out clearest in the whole affair, as it presented itself to the mind of Nicholas, was that the older, wiser, and better people had been proved to be profoundly in error in matters about which they had expressed the utmost assurance.",
    "img": null,
    "audio": null
   },
   {
    "text": "“You said there couldn’t possibly be a frog in my bread-and-milk; there was a frog in my bread-and-milk,” he repeated, with the insistence of a skilled tactician who does not intend to shift from favourable ground.",
    "img": null,
    "audio": null
   },
   {
    "text": "So his boy-cousin and girl-cousin and his quite uninteresting younger brother were to be taken to Jagborough sands that afternoon and he was to stay at home. His cousins’ aunt, who insisted, by an unwarranted stretch of imagination, in styling herself his aunt also, had hastily invented the Jagborough expedition in order to impress on Nicholas the delights that he had justly forfeited by his disgraceful conduct at the breakfast-table. It was her habit, whenever one of the children fell from grace, to improvise something of a festival nature from which the offender would be rigorously debarred; if all the children sinned collectively they were suddenly informed of a circus in a neighbouring town, a circus of unrivalled merit and uncounted elephants, to which, but for their depravity, they would have been taken that very day.",
    "img": null,
    "audio": null
   },
   {
    "text": "A few decent tears were looked for on the part of Nicholas when the moment for the departure of the expedition arrived. As a matter of fact, however, all the crying was done by his girl-cousin, who scraped her knee rather painfully against the step of the carriage as she was scrambling in. “How she did howl,” said Nicholas cheerfully, as the party drove off without any of the elation of high spirits that should have characterised it. “She’ll soon get over that,” said the soi-disant aunt; “it will be a glorious afternoon for racing about over those beautiful sands. How they will enjoy themselves!”",
    "img": null,
    "audio": null
   },
   {
    "text": "“Bobby won’t enjoy himself much, and he won’t race much either,” said Nicholas with a grim chuckle; “his boots are hurting him. They’re too tight.” “Why didn’t he tell me they were hurting?” asked the aunt with some asperity. “He told you twice, but you weren’t listening. You often don’t listen when we tell you important things.” “You are not to go into the gooseberry garden,” said the aunt, changing the subject. “Why not?” demanded Nicholas. “Because you are in disgrace,” said the aunt loftily.",
    "img": null,
    "audio": null
   },
   {
    "text": "Nicholas did not admit the flawlessness of the reasoning; he felt perfectly capable of being in disgrace and in a gooseberry garden at the same moment. His face took on an expression of considerable obstinacy. It was clear to his aunt that he was determined to get into the gooseberry garden, “only,” as she remarked to herself, “because I have told him he is not to.”",
    "img": null,
    "audio": null
   },
   {
    "text": "Now the gooseberry garden had two doors by which it might be entered, and once a small person like Nicholas could slip in there he could effectually disappear from view amid the masking growth of artichokes, raspberry canes, and fruit bushes. The aunt had many other things to do that afternoon, but she spent an hour or two in trivial gardening operations among flower beds and shrubberies, whence she could keep a watchful eye on the two doors that led to the forbidden paradise. She was a woman of few ideas, with immense powers of concentration.",
    "img": null,
    "audio": null
   },
   {
    "text": "Nicholas made one or two sorties into the front garden, wriggling his way with obvious stealth of purpose towards one or other of the doors, but never able for a moment to evade the aunt’s watchful eye. As a matter of fact, he had no intention of trying to get into the gooseberry garden, but it was extremely convenient for him that his aunt should believe that he had; it was a belief that would keep her on self-imposed sentry-duty for the greater part of the afternoon. Having thoroughly confirmed and fortified her suspicions Nicholas slipped back into the house and rapidly put into execution a plan of action that had long germinated in his brain. By standing on a chair in the library one could reach a shelf on which reposed a fat, important-looking key.",
    "img": null,
    "audio": null
   },
   {
    "text": "The key was as important as it looked; it was the instrument which kept the mysteries of the lumber-room secure from unauthorised intrusion, which opened a way only for aunts and such-like privileged persons. Nicholas had not had much experience of the art of fitting keys into keyholes and turning locks, but for some days past he had practised with the key of the schoolroom door; he did not believe in trusting too much to luck and accident. The key turned stiffly in the lock, but it turned. The door opened, and Nicholas was in an unknown land, compared with which the gooseberry garden was a stale delight, a mere material pleasure.",
    "img": null,
    "audio": null
   },
   {
    "text": "Often and often Nicholas had pictured to himself what the lumber-room might be like, that region that was so carefully sealed from youthful eyes and concerning which no questions were ever answered. It came up to his expectations. In the first place it was large and dimly lit, one high window opening on to the forbidden garden being its only source of illumination. In the second place it was a storehouse of unimagined treasures. The aunt-by-assertion was one of those people who think that things spoil by use and consign them to dust and damp by way of preserving them. Such parts of the house as Nicholas knew best were rather bare and cheerless, but here there were wonderful things for the eye to feast on. First and foremost there was a piece of framed tapestry that was evidently meant to be a fire-screen.",
    "img": null,
    "audio": null
   },
   {
    "text": "To Nicholas it was a living, breathing story; he sat down on a roll of Indian hangings, glowing in wonderful colours beneath a layer of dust, and took in all the details of the tapestry picture. A man, dressed in the hunting costume of some remote period, had just transfixed a stag with an arrow; it could not have been a difficult shot because the stag was only one or two paces away from him; in the thickly-growing vegetation that the picture suggested it would not have been difficult to creep up to a feeding stag, and the two spotted dogs that were springing forward to join in the chase had evidently been trained to keep to heel till the arrow was discharged.",
    "img": null,
    "audio": null
   },
   {
    "text": "That part of the picture was simple, if interesting, but did the huntsman see, what Nicholas saw, that four galloping wolves were coming in his direction through the wood? There might be more than four of them hidden behind the trees, and in any case would the man and his dogs be able to cope with the four wolves if they made an attack? The man had only two arrows left in his quiver, and he might miss with one or both of them; all one knew about his skill in shooting was that he could hit a large stag at a ridiculously short range. Nicholas sat for many golden minutes revolving the possibilities of the scene; he was inclined to think that there were more than four wolves and that the man and his dogs were in a tight corner.",
    "img": null,
    "audio": null
   },
   {
    "text": "But there were other objects of delight and interest claiming his instant attention: there were quaint twisted candlesticks in the shape of snakes, and a teapot fashioned like a china duck, out of whose open beak the tea was supposed to come. How dull and shapeless the nursery teapot seemed in comparison! And there was a carved sandal-wood box packed tight with aromatic cotton-wool, and between the layers of cotton-wool were little brass figures, hump-necked bulls, and peacocks and goblins, delightful to see and to handle. Less promising in appearance was a large square book with plain black covers; Nicholas peeped into it, and, behold, it was full of coloured pictures of birds. And such birds!",
    "img": null,
    "audio": null
   },
   {
    "text": "In the garden, and in the lanes when he went for a walk, Nicholas came across a few birds, of which the largest were an occasional magpie or wood-pigeon; here were herons and bustards, kites, toucans, tiger-bitterns, brush turkeys, ibises, golden pheasants, a whole portrait gallery of undreamed-of creatures. And as he was admiring the colouring of the mandarin duck and assigning a life-history to it, the voice of his aunt in shrill vociferation of his name came from the gooseberry garden without. She had grown suspicious at his long disappearance, and had leapt to the conclusion that he had climbed over the wall behind the sheltering screen of the lilac bushes; she was now engaged in energetic and rather hopeless search for him among the artichokes and raspberry canes.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Nicholas, Nicholas!” she screamed, “you are to come out of this at once. It’s no use trying to hide there; I can see you all the time.” It was probably the first time for twenty years that anyone had smiled in that lumber-room. Presently the angry repetitions of Nicholas’ name gave way to a shriek, and a cry for somebody to come quickly. Nicholas shut the book, restored it carefully to its place in a corner, and shook some dust from a neighbouring pile of newspapers over it. Then he crept from the room, locked the door, and replaced the key exactly where he had found it. His aunt was still calling his name when he sauntered into the front garden.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Who’s calling?” he asked. “Me,” came the answer from the other side of the wall; “didn’t you hear me? I’ve been looking for you in the gooseberry garden, and I’ve slipped into the rain-water tank. Luckily there’s no water in it, but the sides are slippery and I can’t get out. Fetch the little ladder from under the cherry tree—” “I was told I wasn’t to go into the gooseberry garden,” said Nicholas promptly. “I told you not to, and now I tell you that you may,” came the voice from the rain-water tank, rather impatiently.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Your voice doesn’t sound like aunt’s,” objected Nicholas; “you may be the Evil One tempting me to be disobedient. Aunt often tells me that the Evil One tempts me and that I always yield. This time I’m not going to yield.” “Don’t talk nonsense,” said the prisoner in the tank; “go and fetch the ladder.” “Will there be strawberry jam for tea?” asked Nicholas innocently. “Certainly there will be,” said the aunt, privately resolving that Nicholas should have none of it. “Now I know that you are the Evil One and not aunt,” shouted Nicholas gleefully; “when we asked aunt for strawberry jam yesterday she said there wasn’t any. I know there are four jars of it in the store cupboard, because I looked, and of course you know it’s there, but she doesn’t, because she said there wasn’t any. Oh, Devil, you have sold yourself!”",
    "img": null,
    "audio": null
   },
   {
    "text": "There was an unusual sense of luxury in being able to talk to an aunt as though one was talking to the Evil One, but Nicholas knew, with childish discernment, that such luxuries were not to be over-indulged in. He walked noisily away, and it was a kitchenmaid, in search of parsley, who eventually rescued the aunt from the rain-water tank.",
    "img": null,
    "audio": null
   },
   {
    "text": "Tea that evening was partaken of in a fearsome silence. The tide had been at its highest when the children had arrived at Jagborough Cove, so there had been no sands to play on—a circumstance that the aunt had overlooked in the haste of organising her punitive expedition. The tightness of Bobby’s boots had had disastrous effect on his temper the whole of the afternoon, and altogether the children could not have been said to have enjoyed themselves. The aunt maintained the frozen muteness of one who has suffered undignified and unmerited detention in a rain-water tank for thirty-five minutes. As for Nicholas, he, too, was silent, in the absorption of one who has much to think about; it was just possible, he considered, that the huntsman would escape with his hounds while the wolves feasted on the stricken stag.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "story-teller",
  "title": "The Story-Teller",
  "author": "Saki (H. H. Munro)",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (Beasts and Super-Beasts, #269)",
  "url": "https://www.gutenberg.org/ebooks/269",
  "pages": [
   {
    "text": "It was a hot afternoon, and the railway carriage was correspondingly sultry, and the next stop was at Templecombe, nearly an hour ahead. The occupants of the carriage were a small girl, and a smaller girl, and a small boy. An aunt belonging to the children occupied one corner seat, and the further corner seat on the opposite side was occupied by a bachelor who was a stranger to their party, but the small girls and the small boy emphatically occupied the compartment. Both the aunt and the children were conversational in a limited, persistent way, reminding one of the attentions of a housefly that refuses to be discouraged. Most of the aunt’s remarks seemed to begin with “Don’t,” and nearly all of the children’s remarks began with “Why?” The bachelor said nothing out loud. “Don’t, Cyril, don’t,” exclaimed the aunt, as the small boy began smacking the cushions of the seat, producing a cloud of dust at each blow.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Come and look out of the window,” she added. The child moved reluctantly to the window. “Why are those sheep being driven out of that field?” he asked. “I expect they are being driven to another field where there is more grass,” said the aunt weakly. “But there is lots of grass in that field,” protested the boy; “there’s nothing else but grass there. Aunt, there’s lots of grass in that field.” “Perhaps the grass in the other field is better,” suggested the aunt fatuously. “Why is it better?” came the swift, inevitable question.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Oh, look at those cows!” exclaimed the aunt. Nearly every field along the line had contained cows or bullocks, but she spoke as though she were drawing attention to a rarity. “Why is the grass in the other field better?” persisted Cyril. The frown on the bachelor’s face was deepening to a scowl. He was a hard, unsympathetic man, the aunt decided in her mind. She was utterly unable to come to any satisfactory decision about the grass in the other field.",
    "img": null,
    "audio": null
   },
   {
    "text": "The smaller girl created a diversion by beginning to recite “On the Road to Mandalay.” She only knew the first line, but she put her limited knowledge to the fullest possible use. She repeated the line over and over again in a dreamy but resolute and very audible voice; it seemed to the bachelor as though some one had had a bet with her that she could not repeat the line aloud two thousand times without stopping. Whoever it was who had made the wager was likely to lose his bet.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Come over here and listen to a story,” said the aunt, when the bachelor had looked twice at her and once at the communication cord. The children moved listlessly towards the aunt’s end of the carriage. Evidently her reputation as a story-teller did not rank high in their estimation. In a low, confidential voice, interrupted at frequent intervals by loud, petulant questionings from her listeners, she began an unenterprising and deplorably uninteresting story about a little girl who was good, and made friends with every one on account of her goodness, and was finally saved from a mad bull by a number of rescuers who admired her moral character.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Wouldn’t they have saved her if she hadn’t been good?” demanded the bigger of the small girls. It was exactly the question that the bachelor had wanted to ask. “Well, yes,” admitted the aunt lamely, “but I don’t think they would have run quite so fast to her help if they had not liked her so much.” “It’s the stupidest story I’ve ever heard,” said the bigger of the small girls, with immense conviction. “I didn’t listen after the first bit, it was so stupid,” said Cyril. The smaller girl made no actual comment on the story, but she had long ago recommenced a murmured repetition of her favourite line.",
    "img": null,
    "audio": null
   },
   {
    "text": "“You don’t seem to be a success as a story-teller,” said the bachelor suddenly from his corner. The aunt bristled in instant defence at this unexpected attack. “It’s a very difficult thing to tell stories that children can both understand and appreciate,” she said stiffly. “I don’t agree with you,” said the bachelor. “Perhaps you would like to tell them a story,” was the aunt’s retort. “Tell us a story,” demanded the bigger of the small girls. “Once upon a time,” began the bachelor, “there was a little girl called Bertha, who was extraordinarily good.”",
    "img": null,
    "audio": null
   },
   {
    "text": "The children’s momentarily-aroused interest began at once to flicker; all stories seemed dreadfully alike, no matter who told them. “She did all that she was told, she was always truthful, she kept her clothes clean, ate milk puddings as though they were jam tarts, learned her lessons perfectly, and was polite in her manners.” “Was she pretty?” asked the bigger of the small girls. “Not as pretty as any of you,” said the bachelor, “but she was horribly good.” There was a wave of reaction in favour of the story; the word horrible in connection with goodness was a novelty that commended itself. It seemed to introduce a ring of truth that was absent from the aunt’s tales of infant life.",
    "img": null,
    "audio": null
   },
   {
    "text": "“She was so good,” continued the bachelor, “that she won several medals for goodness, which she always wore, pinned on to her dress. There was a medal for obedience, another medal for punctuality, and a third for good behaviour. They were large metal medals and they clicked against one another as she walked. No other child in the town where she lived had as many as three medals, so everybody knew that she must be an extra good child.” “Horribly good,” quoted Cyril.",
    "img": null,
    "audio": null
   },
   {
    "text": "“Everybody talked about her goodness, and the Prince of the country got to hear about it, and he said that as she was so very good she might be allowed once a week to walk in his park, which was just outside the town. It was a beautiful park, and no children were ever allowed in it, so it was a great honour for Bertha to be allowed to go there.” “Were there any sheep in the park?” demanded Cyril. “No;” said the bachelor, “there were no sheep.” “Why weren’t there any sheep?” came the inevitable question arising out of that answer.",
    "img": null,
    "audio": null
   },
   {
    "text": "The aunt permitted herself a smile, which might almost have been described as a grin. “There were no sheep in the park,” said the bachelor, “because the Prince’s mother had once had a dream that her son would either be killed by a sheep or else by a clock falling on him. For that reason the Prince never kept a sheep in his park or a clock in his palace.” The aunt suppressed a gasp of admiration. “Was the Prince killed by a sheep or by a clock?” asked Cyril.",
    "img": null,
    "audio": null
   },
   {
    "text": "“He is still alive, so we can’t tell whether the dream will come true,” said the bachelor unconcernedly; “anyway, there were no sheep in the park, but there were lots of little pigs running all over the place.” “What colour were they?” “Black with white faces, white with black spots, black all over, grey with white patches, and some were white all over.” The story-teller paused to let a full idea of the park’s treasures sink into the children’s imaginations; then he resumed: “Bertha was rather sorry to find that there were no flowers in the park. She had promised her aunts, with tears in her eyes, that she would not pick any of the kind Prince’s flowers, and she had meant to keep her promise, so of course it made her feel silly to find that there were no flowers to pick.”",
    "img": null,
    "audio": null
   },
   {
    "text": "“Why weren’t there any flowers?” “Because the pigs had eaten them all,” said the bachelor promptly. “The gardeners had told the Prince that you couldn’t have pigs and flowers, so he decided to have pigs and no flowers.” There was a murmur of approval at the excellence of the Prince’s decision; so many people would have decided the other way.",
    "img": null,
    "audio": null
   },
   {
    "text": "“There were lots of other delightful things in the park. There were ponds with gold and blue and green fish in them, and trees with beautiful parrots that said clever things at a moment’s notice, and humming birds that hummed all the popular tunes of the day. Bertha walked up and down and enjoyed herself immensely, and thought to herself: ‘If I were not so extraordinarily good I should not have been allowed to come into this beautiful park and enjoy all that there is to be seen in it,’ and her three medals clinked against one another as she walked and helped to remind her how very good she really was. Just then an enormous wolf came prowling into the park to see if it could catch a fat little pig for its supper.”",
    "img": null,
    "audio": null
   },
   {
    "text": "“What colour was it?” asked the children, amid an immediate quickening of interest. “Mud-colour all over, with a black tongue and pale grey eyes that gleamed with unspeakable ferocity. The first thing that it saw in the park was Bertha; her pinafore was so spotlessly white and clean that it could be seen from a great distance. Bertha saw the wolf and saw that it was stealing towards her, and she began to wish that she had never been allowed to come into the park. She ran as hard as she could, and the wolf came after her with huge leaps and bounds. She managed to reach a shrubbery of myrtle bushes and she hid herself in one of the thickest of the bushes. The wolf came sniffing among the branches, its black tongue lolling out of its mouth and its pale grey eyes glaring with rage.",
    "img": null,
    "audio": null
   },
   {
    "text": "Bertha was terribly frightened, and thought to herself: ‘If I had not been so extraordinarily good I should have been safe in the town at this moment.’ However, the scent of the myrtle was so strong that the wolf could not sniff out where Bertha was hiding, and the bushes were so thick that he might have hunted about in them for a long time without catching sight of her, so he thought he might as well go off and catch a little pig instead. Bertha was trembling very much at having the wolf prowling and sniffing so near her, and as she trembled the medal for obedience clinked against the medals for good conduct and punctuality. The wolf was just moving away when he heard the sound of the medals clinking and stopped to listen; they clinked again in a bush quite near him.",
    "img": null,
    "audio": null
   },
   {
    "text": "He dashed into the bush, his pale grey eyes gleaming with ferocity and triumph, and dragged Bertha out and devoured her to the last morsel. All that was left of her were her shoes, bits of clothing, and the three medals for goodness.” “Were any of the little pigs killed?” “No, they all escaped.” “The story began badly,” said the smaller of the small girls, “but it had a beautiful ending.” “It is the most beautiful story that I ever heard,” said the bigger of the small girls, with immense decision.",
    "img": null,
    "audio": null
   },
   {
    "text": "“It is the only beautiful story I have ever heard,” said Cyril. A dissentient opinion came from the aunt. “A most improper story to tell to young children! You have undermined the effect of years of careful teaching.” “At any rate,” said the bachelor, collecting his belongings preparatory to leaving the carriage, “I kept them quiet for ten minutes, which was more than you were able to do.” “Unhappy woman!” he observed to himself as he walked down the platform of Templecombe station; “for the next six months or so those children will assail her in public with demands for an improper story!”",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "selfish-giant",
  "title": "The Selfish Giant",
  "author": "Oscar Wilde",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (The Happy Prince and Other Tales, #902)",
  "url": "https://www.gutenberg.org/ebooks/902",
  "pages": [
   {
    "text": "EVERY afternoon, as they were coming from school, the children used to go and play in the Giant’s garden. It was a large lovely garden, with soft green grass. Here and there over the grass stood beautiful flowers like stars, and there were twelve peach-trees that in the spring-time broke out into delicate blossoms of pink and pearl, and in the autumn bore rich fruit. The birds sat on the trees and sang so sweetly that the children used to stop their games in order to listen to them. “How happy we are here!” they cried to each other.",
    "img": null,
    "audio": null
   },
   {
    "text": "One day the Giant came back. He had been to visit his friend the Cornish ogre, and had stayed with him for seven years. After the seven years were over he had said all that he had to say, for his conversation was limited, and he determined to return to his own castle. When he arrived he saw the children playing in the garden. “What are you doing here?” he cried in a very gruff voice, and the children ran away. “My own garden is my own garden,” said the Giant; “any one can understand that, and I will allow nobody to play in it but myself.” So he built a high wall all round it, and put up a notice-board.",
    "img": null,
    "audio": null
   },
   {
    "text": "TRESPASSERS WILL BE PROSECUTED He was a very selfish Giant. The poor children had now nowhere to play. They tried to play on the road, but the road was very dusty and full of hard stones, and they did not like it. They used to wander round the high wall when their lessons were over, and talk about the beautiful garden inside. “How happy we were there,” they said to each other. Then the Spring came, and all over the country there were little blossoms and little birds. Only in the garden of the Selfish Giant it was still winter. The birds did not care to sing in it as there were no children, and the trees forgot to blossom.",
    "img": null,
    "audio": null
   },
   {
    "text": "Once a beautiful flower put its head out from the grass, but when it saw the notice-board it was so sorry for the children that it slipped back into the ground again, and went off to sleep. The only people who were pleased were the Snow and the Frost. “Spring has forgotten this garden,” they cried, “so we will live here all the year round.” The Snow covered up the grass with her great white cloak, and the Frost painted all the trees silver. Then they invited the North Wind to stay with them, and he came. He was wrapped in furs, and he roared all day about the garden, and blew the chimney-pots down. “This is a delightful spot,” he said, “we must ask the Hail on a visit.” So the Hail came.",
    "img": null,
    "audio": null
   },
   {
    "text": "Every day for three hours he rattled on the roof of the castle till he broke most of the slates, and then he ran round and round the garden as fast as he could go. He was dressed in grey, and his breath was like ice. “I cannot understand why the Spring is so late in coming,” said the Selfish Giant, as he sat at the window and looked out at his cold white garden; “I hope there will be a change in the weather.” But the Spring never came, nor the Summer. The Autumn gave golden fruit to every garden, but to the Giant’s garden she gave none. “He is too selfish,” she said. So it was always Winter there, and the North Wind, and the Hail, and the Frost, and the Snow danced about through the trees.",
    "img": null,
    "audio": null
   },
   {
    "text": "One morning the Giant was lying awake in bed when he heard some lovely music. It sounded so sweet to his ears that he thought it must be the King’s musicians passing by. It was really only a little linnet singing outside his window, but it was so long since he had heard a bird sing in his garden that it seemed to him to be the most beautiful music in the world. Then the Hail stopped dancing over his head, and the North Wind ceased roaring, and a delicious perfume came to him through the open casement. “I believe the Spring has come at last,” said the Giant; and he jumped out of bed and looked out.",
    "img": null,
    "audio": null
   },
   {
    "text": "What did he see?",
    "img": null,
    "audio": null
   },
   {
    "text": "He saw a most wonderful sight. Through a little hole in the wall the children had crept in, and they were sitting in the branches of the trees. In every tree that he could see there was a little child. And the trees were so glad to have the children back again that they had covered themselves with blossoms, and were waving their arms gently above the children’s heads. The birds were flying about and twittering with delight, and the flowers were looking up through the green grass and laughing. It was a lovely scene, only in one corner it was still winter. It was the farthest corner of the garden, and in it was standing a little boy. He was so small that he could not reach up to the branches of the tree, and he was wandering all round it, crying bitterly. The poor tree was still quite covered with frost and snow, and the North Wind was blowing and roaring above it. “Climb up! little boy,” said the Tree, and it bent its branches down as low as it could; but the boy was too tiny.",
    "img": null,
    "audio": null
   },
   {
    "text": "And the Giant’s heart melted as he looked out. “How selfish I have been!” he said; “now I know why the Spring would not come here. I will put that poor little boy on the top of the tree, and then I will knock down the wall, and my garden shall be the children’s playground for ever and ever.” He was really very sorry for what he had done.",
    "img": null,
    "audio": null
   },
   {
    "text": "So he crept downstairs and opened the front door quite softly, and went out into the garden. But when the children saw him they were so frightened that they all ran away, and the garden became winter again. Only the little boy did not run, for his eyes were so full of tears that he did not see the Giant coming. And the Giant stole up behind him and took him gently in his hand, and put him up into the tree. And the tree broke at once into blossom, and the birds came and sang on it, and the little boy stretched out his two arms and flung them round the Giant’s neck, and kissed him. And the other children, when they saw that the Giant was not wicked any longer, came running back, and with them came the Spring. “It is your garden now, little children,” said the Giant, and he took a great axe and knocked down the wall. And when the people were going to market at twelve o’clock they found the Giant playing with the children in the most beautiful garden they had ever seen.",
    "img": null,
    "audio": null
   },
   {
    "text": "All day long they played, and in the evening they came to the Giant to bid him good-bye. “But where is your little companion?” he said: “the boy I put into the tree.” The Giant loved him the best because he had kissed him. “We don’t know,” answered the children; “he has gone away.” “You must tell him to be sure and come here to-morrow,” said the Giant. But the children said that they did not know where he lived, and had never seen him before; and the Giant felt very sad.",
    "img": null,
    "audio": null
   },
   {
    "text": "Every afternoon, when school was over, the children came and played with the Giant. But the little boy whom the Giant loved was never seen again. The Giant was very kind to all the children, yet he longed for his first little friend, and often spoke of him. “How I would like to see him!” he used to say. Years went over, and the Giant grew very old and feeble. He could not play about any more, so he sat in a huge armchair, and watched the children at their games, and admired his garden. “I have many beautiful flowers,” he said; “but the children are the most beautiful flowers of all.”",
    "img": null,
    "audio": null
   },
   {
    "text": "One winter morning he looked out of his window as he was dressing. He did not hate the Winter now, for he knew that it was merely the Spring asleep, and that the flowers were resting. Suddenly he rubbed his eyes in wonder, and looked and looked. It certainly was a marvellous sight. In the farthest corner of the garden was a tree quite covered with lovely white blossoms. Its branches were all golden, and silver fruit hung down from them, and underneath it stood the little boy he had loved.",
    "img": null,
    "audio": null
   },
   {
    "text": "Downstairs ran the Giant in great joy, and out into the garden. He hastened across the grass, and came near to the child. And when he came quite close his face grew red with anger, and he said, “Who hath dared to wound thee?” For on the palms of the child’s hands were the prints of two nails, and the prints of two nails were on the little feet. “Who hath dared to wound thee?” cried the Giant; “tell me, that I may take my big sword and slay him.”",
    "img": null,
    "audio": null
   },
   {
    "text": "“Nay!” answered the child; “but these are the wounds of Love.” “Who art thou?” said the Giant, and a strange awe fell on him, and he knelt before the little child. And the child smiled on the Giant, and said to him, “You let me play once in your garden, to-day you shall come with me to my garden, which is Paradise.” And when the children ran in that afternoon, they found the Giant lying dead under the tree, all covered with white blossoms.",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "tell-tale-heart",
  "title": "The Tell-Tale Heart",
  "author": "Edgar Allan Poe",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (The Works of Edgar Allan Poe, vol. 2, #2148)",
  "url": "https://www.gutenberg.org/ebooks/2148",
  "pages": [
   {
    "text": "TRUE!--nervous--very, very dreadfully nervous I had been and am; but why will you say that I am mad? The disease had sharpened my senses--not destroyed--not dulled them. Above all was the sense of hearing acute. I heard all things in the heaven and in the earth. I heard many things in hell. How, then, am I mad? Hearken! and observe how healthily--how calmly I can tell you the whole story.",
    "img": null,
    "audio": null
   },
   {
    "text": "It is impossible to say how first the idea entered my brain; but once conceived, it haunted me day and night. Object there was none. Passion there was none. I loved the old man. He had never wronged me. He had never given me insult. For his gold I had no desire. I think it was his eye! yes, it was this! He had the eye of a vulture--a pale blue eye, with a film over it. Whenever it fell upon me, my blood ran cold; and so by degrees--very gradually--I made up my mind to take the life of the old man, and thus rid myself of the eye forever.",
    "img": null,
    "audio": null
   },
   {
    "text": "Now this is the point. You fancy me mad. Madmen know nothing. But you should have seen me. You should have seen how wisely I proceeded--with what caution--with what foresight--with what dissimulation I went to work! I was never kinder to the old man than during the whole week before I killed him. And every night, about midnight, I turned the latch of his door and opened it--oh so gently! And then, when I had made an opening sufficient for my head, I put in a dark lantern, all closed, closed, that no light shone out, and then I thrust in my head. Oh, you would have laughed to see how cunningly I thrust it in! I moved it slowly--very, very slowly, so that I might not disturb the old man’s sleep.",
    "img": null,
    "audio": null
   },
   {
    "text": "It took me an hour to place my whole head within the opening so far that I could see him as he lay upon his bed. Ha! would a madman have been so wise as this? And then, when my head was well in the room, I undid the lantern cautiously--oh, so cautiously--cautiously (for the hinges creaked)--I undid it just so much that a single thin ray fell upon the vulture eye. And this I did for seven long nights--every night just at midnight--but I found the eye always closed; and so it was impossible to do the work; for it was not the old man who vexed me, but his Evil Eye. And every morning, when the day broke, I went boldly into the chamber, and spoke courageously to him, calling him by name in a hearty tone, and inquiring how he has passed the night.",
    "img": null,
    "audio": null
   },
   {
    "text": "So you see he would have been a very profound old man, indeed, to suspect that every night, just at twelve, I looked in upon him while he slept.",
    "img": null,
    "audio": null
   },
   {
    "text": "Upon the eighth night I was more than usually cautious in opening the door. A watch’s minute hand moves more quickly than did mine. Never before that night had I felt the extent of my own powers--of my sagacity. I could scarcely contain my feelings of triumph. To think that there I was, opening the door, little by little, and he not even to dream of my secret deeds or thoughts. I fairly chuckled at the idea; and perhaps he heard me; for he moved on the bed suddenly, as if startled. Now you may think that I drew back--but no. His room was as black as pitch with the thick darkness, (for the shutters were close fastened, through fear of robbers,) and so I knew that he could not see the opening of the door, and I kept pushing it on steadily, steadily.",
    "img": null,
    "audio": null
   },
   {
    "text": "I had my head in, and was about to open the lantern, when my thumb slipped upon the tin fastening, and the old man sprang up in bed, crying out--“Who’s there?” I kept quite still and said nothing. For a whole hour I did not move a muscle, and in the meantime I did not hear him lie down. He was still sitting up in the bed listening;--just as I have done, night after night, hearkening to the death watches in the wall. Presently I heard a slight groan, and I knew it was the groan of mortal terror. It was not a groan of pain or of grief--oh, no!--it was the low stifled sound that arises from the bottom of the soul when overcharged with awe. I knew the sound well.",
    "img": null,
    "audio": null
   },
   {
    "text": "Many a night, just at midnight, when all the world slept, it has welled up from my own bosom, deepening, with its dreadful echo, the terrors that distracted me. I say I knew it well. I knew what the old man felt, and pitied him, although I chuckled at heart. I knew that he had been lying awake ever since the first slight noise, when he had turned in the bed. His fears had been ever since growing upon him. He had been trying to fancy them causeless, but could not. He had been saying to himself--“It is nothing but the wind in the chimney--it is only a mouse crossing the floor,” or “It is merely a cricket which has made a single chirp.” Yes, he had been trying to comfort himself with these suppositions: but he had found all in vain.",
    "img": null,
    "audio": null
   },
   {
    "text": "All in vain; because Death, in approaching him had stalked with his black shadow before him, and enveloped the victim. And it was the mournful influence of the unperceived shadow that caused him to feel--although he neither saw nor heard--to feel the presence of my head within the room. When I had waited a long time, very patiently, without hearing him lie down, I resolved to open a little--a very, very little crevice in the lantern. So I opened it--you cannot imagine how stealthily, stealthily--until, at length a simple dim ray, like the thread of the spider, shot from out the crevice and fell full upon the vulture eye.",
    "img": null,
    "audio": null
   },
   {
    "text": "It was open--wide, wide open--and I grew furious as I gazed upon it. I saw it with perfect distinctness--all a dull blue, with a hideous veil over it that chilled the very marrow in my bones; but I could see nothing else of the old man’s face or person: for I had directed the ray as if by instinct, precisely upon the damned spot. And have I not told you that what you mistake for madness is but over-acuteness of the sense?--now, I say, there came to my ears a low, dull, quick sound, such as a watch makes when enveloped in cotton. I knew that sound well, too. It was the beating of the old man’s heart. It increased my fury, as the beating of a drum stimulates the soldier into courage.",
    "img": null,
    "audio": null
   },
   {
    "text": "But even yet I refrained and kept still. I scarcely breathed. I held the lantern motionless. I tried how steadily I could maintain the ray upon the eve. Meantime the hellish tattoo of the heart increased. It grew quicker and quicker, and louder and louder every instant. The old man’s terror must have been extreme! It grew louder, I say, louder every moment!--do you mark me well I have told you that I am nervous: so I am. And now at the dead hour of the night, amid the dreadful silence of that old house, so strange a noise as this excited me to uncontrollable terror. Yet, for some minutes longer I refrained and stood still. But the beating grew louder, louder! I thought the heart must burst. And now a new anxiety seized me--the sound would be heard by a neighbour! The old man’s hour had come!",
    "img": null,
    "audio": null
   },
   {
    "text": "With a loud yell, I threw open the lantern and leaped into the room. He shrieked once--once only. In an instant I dragged him to the floor, and pulled the heavy bed over him. I then smiled gaily, to find the deed so far done. But, for many minutes, the heart beat on with a muffled sound. This, however, did not vex me; it would not be heard through the wall. At length it ceased. The old man was dead. I removed the bed and examined the corpse. Yes, he was stone, stone dead. I placed my hand upon the heart and held it there many minutes. There was no pulsation. He was stone dead. His eye would trouble me no more.",
    "img": null,
    "audio": null
   },
   {
    "text": "If still you think me mad, you will think so no longer when I describe the wise precautions I took for the concealment of the body. The night waned, and I worked hastily, but in silence. First of all I dismembered the corpse. I cut off the head and the arms and the legs. I then took up three planks from the flooring of the chamber, and deposited all between the scantlings. I then replaced the boards so cleverly, so cunningly, that no human eye--not even his--could have detected any thing wrong. There was nothing to wash out--no stain of any kind--no blood-spot whatever. I had been too wary for that. A tub had caught all--ha! ha!",
    "img": null,
    "audio": null
   },
   {
    "text": "When I had made an end of these labors, it was four o’clock--still dark as midnight. As the bell sounded the hour, there came a knocking at the street door. I went down to open it with a light heart,--for what had I now to fear? There entered three men, who introduced themselves, with perfect suavity, as officers of the police. A shriek had been heard by a neighbour during the night; suspicion of foul play had been aroused; information had been lodged at the police office, and they (the officers) had been deputed to search the premises.",
    "img": null,
    "audio": null
   },
   {
    "text": "I smiled,--for what had I to fear? I bade the gentlemen welcome. The shriek, I said, was my own in a dream. The old man, I mentioned, was absent in the country. I took my visitors all over the house. I bade them search--search well. I led them, at length, to his chamber. I showed them his treasures, secure, undisturbed. In the enthusiasm of my confidence, I brought chairs into the room, and desired them here to rest from their fatigues, while I myself, in the wild audacity of my perfect triumph, placed my own seat upon the very spot beneath which reposed the corpse of the victim.",
    "img": null,
    "audio": null
   },
   {
    "text": "The officers were satisfied. My manner had convinced them. I was singularly at ease. They sat, and while I answered cheerily, they chatted of familiar things. But, ere long, I felt myself getting pale and wished them gone. My head ached, and I fancied a ringing in my ears: but still they sat and still chatted. The ringing became more distinct:--It continued and became more distinct: I talked more freely to get rid of the feeling: but it continued and gained definiteness--until, at length, I found that the noise was not within my ears.",
    "img": null,
    "audio": null
   },
   {
    "text": "No doubt I now grew very pale;--but I talked more fluently, and with a heightened voice. Yet the sound increased--and what could I do? It was a low, dull, quick sound--much such a sound as a watch makes when enveloped in cotton. I gasped for breath--and yet the officers heard it not. I talked more quickly--more vehemently; but the noise steadily increased. I arose and argued about trifles, in a high key and with violent gesticulations; but the noise steadily increased. Why would they not be gone? I paced the floor to and fro with heavy strides, as if excited to fury by the observations of the men--but the noise steadily increased. Oh God! what could I do? I foamed--I raved--I swore! I swung the chair upon which I had been sitting, and grated it upon the boards, but the noise arose over all and continually increased. It grew louder--louder--louder!",
    "img": null,
    "audio": null
   },
   {
    "text": "And still the men chatted pleasantly, and smiled. Was it possible they heard not? Almighty God!--no, no! They heard!--they suspected!--they knew!--they were making a mockery of my horror!-this I thought, and this I think. But anything was better than this agony! Anything was more tolerable than this derision! I could bear those hypocritical smiles no longer! I felt that I must scream or die! and now--again!--hark! louder! louder! louder! louder! “Villains!” I shrieked, “dissemble no more! I admit the deed!--tear up the planks! here, here!--It is the beating of his hideous heart!”",
    "img": null,
    "audio": null
   }
  ]
 },
 {
  "id": "lady-or-tiger",
  "title": "The Lady, or the Tiger?",
  "author": "Frank R. Stockton",
  "art": "",
  "voice": "",
  "license": "Dominio público",
  "source": "Project Gutenberg (The Lady, or the Tiger?, #396)",
  "url": "https://www.gutenberg.org/ebooks/396",
  "pages": [
   {
    "text": "In the very olden time there lived a semi-barbaric king, whose ideas, though somewhat polished and sharpened by the progressiveness of distant Latin neighbors, were still large, florid, and untrammeled, as became the half of him which was barbaric. He was a man of exuberant fancy, and, withal, of an authority so irresistible that, at his will, he turned his varied fancies into facts. He was greatly given to self-communing, and, when he and himself agreed upon anything, the thing was done. When every member of his domestic and political systems moved smoothly in its appointed course, his nature was bland and genial; but, whenever there was a little hitch, and some of his orbs got out of their orbits, he was blander and more genial still, for nothing pleased him so much as to make the crooked straight and crush down uneven places.",
    "img": null,
    "audio": null
   },
   {
    "text": "Among the borrowed notions by which his barbarism had become semified was that of the public arena, in which, by exhibitions of manly and beastly valor, the minds of his subjects were refined and cultured. But even here the exuberant and barbaric fancy asserted itself. The arena of the king was built, not to give the people an opportunity of hearing the rhapsodies of dying gladiators, nor to enable them to view the inevitable conclusion of a conflict between religious opinions and hungry jaws, but for purposes far better adapted to widen and develop the mental energies of the people. This vast amphitheater, with its encircling galleries, its mysterious vaults, and its unseen passages, was an agent of poetic justice, in which crime was punished, or virtue rewarded, by the decrees of an impartial and incorruptible chance.",
    "img": null,
    "audio": null
   },
   {
    "text": "When a subject was accused of a crime of sufficient importance to interest the king, public notice was given that on an appointed day the fate of the accused person would be decided in the king's arena, a structure which well deserved its name, for, although its form and plan were borrowed from afar, its purpose emanated solely from the brain of this man, who, every barleycorn a king, knew no tradition to which he owed more allegiance than pleased his fancy, and who ingrafted on every adopted form of human thought and action the rich growth of his barbaric idealism.",
    "img": null,
    "audio": null
   },
   {
    "text": "When all the people had assembled in the galleries, and the king, surrounded by his court, sat high up on his throne of royal state on one side of the arena, he gave a signal, a door beneath him opened, and the accused subject stepped out into the amphitheater. Directly opposite him, on the other side of the inclosed space, were two doors, exactly alike and side by side. It was the duty and the privilege of the person on trial to walk directly to these doors and open one of them. He could open either door he pleased; he was subject to no guidance or influence but that of the aforementioned impartial and incorruptible chance.",
    "img": null,
    "audio": null
   },
   {
    "text": "If he opened the one, there came out of it a hungry tiger, the fiercest and most cruel that could be procured, which immediately sprang upon him and tore him to pieces as a punishment for his guilt. The moment that the case of the criminal was thus decided, doleful iron bells were clanged, great wails went up from the hired mourners posted on the outer rim of the arena, and the vast audience, with bowed heads and downcast hearts, wended slowly their homeward way, mourning greatly that one so young and fair, or so old and respected, should have merited so dire a fate.",
    "img": null,
    "audio": null
   },
   {
    "text": "But, if the accused person opened the other door, there came forth from it a lady, the most suitable to his years and station that his majesty could select among his fair subjects, and to this lady he was immediately married, as a reward of his innocence. It mattered not that he might already possess a wife and family, or that his affections might be engaged upon an object of his own selection; the king allowed no such subordinate arrangements to interfere with his great scheme of retribution and reward. The exercises, as in the other instance, took place immediately, and in the arena. Another door opened beneath the king, and a priest, followed by a band of choristers, and dancing maidens blowing joyous airs on golden horns and treading an epithalamic measure, advanced to where the pair stood, side by side, and the wedding was promptly and cheerily solemnized. Then the gay brass bells rang forth their merry peals, the people shouted glad hurrahs, and the innocent man, preceded by children strewing flowers on his path, led his bride to his home.",
    "img": null,
    "audio": null
   },
   {
    "text": "This was the king's semi-barbaric method of administering justice. Its perfect fairness is obvious. The criminal could not know out of which door would come the lady; he opened either he pleased, without having the slightest idea whether, in the next instant, he was to be devoured or married. On some occasions the tiger came out of one door, and on some out of the other. The decisions of this tribunal were not only fair, they were positively determinate: the accused person was instantly punished if he found himself guilty, and, if innocent, he was rewarded on the spot, whether he liked it or not. There was no escape from the judgments of the king's arena.",
    "img": null,
    "audio": null
   },
   {
    "text": "The institution was a very popular one. When the people gathered together on one of the great trial days, they never knew whether they were to witness a bloody slaughter or a hilarious wedding. This element of uncertainty lent an interest to the occasion which it could not otherwise have attained. Thus, the masses were entertained and pleased, and the thinking part of the community could bring no charge of unfairness against this plan, for did not the accused person have the whole matter in his own hands? This semi-barbaric king had a daughter as blooming as his most florid fancies, and with a soul as fervent and imperious as his own. As is usual in such cases, she was the apple of his eye, and was loved by him above all humanity.",
    "img": null,
    "audio": null
   },
   {
    "text": "Among his courtiers was a young man of that fineness of blood and lowness of station common to the conventional heroes of romance who love royal maidens. This royal maiden was well satisfied with her lover, for he was handsome and brave to a degree unsurpassed in all this kingdom, and she loved him with an ardor that had enough of barbarism in it to make it exceedingly warm and strong. This love affair moved on happily for many months, until one day the king happened to discover its existence. He did not hesitate nor waver in regard to his duty in the premises. The youth was immediately cast into prison, and a day was appointed for his trial in the king's arena.",
    "img": null,
    "audio": null
   },
   {
    "text": "This, of course, was an especially important occasion, and his majesty, as well as all the people, was greatly interested in the workings and development of this trial. Never before had such a case occurred; never before had a subject dared to love the daughter of the king. In after years such things became commonplace enough, but then they were in no slight degree novel and startling.",
    "img": null,
    "audio": null
   },
   {
    "text": "The tiger-cages of the kingdom were searched for the most savage and relentless beasts, from which the fiercest monster might be selected for the arena; and the ranks of maiden youth and beauty throughout the land were carefully surveyed by competent judges in order that the young man might have a fitting bride in case fate did not determine for him a different destiny. Of course, everybody knew that the deed with which the accused was charged had been done. He had loved the princess, and neither he, she, nor any one else, thought of denying the fact; but the king would not think of allowing any fact of this kind to interfere with the workings of the tribunal, in which he took such great delight and satisfaction. No matter how the affair turned out, the youth would be disposed of, and the king would take an aesthetic pleasure in watching the course of events, which would determine whether or not the young man had done wrong in allowing himself to love the princess.",
    "img": null,
    "audio": null
   },
   {
    "text": "The appointed day arrived. From far and near the people gathered, and thronged the great galleries of the arena, and crowds, unable to gain admittance, massed themselves against its outside walls. The king and his court were in their places, opposite the twin doors, those fateful portals, so terrible in their similarity. All was ready. The signal was given. A door beneath the royal party opened, and the lover of the princess walked into the arena. Tall, beautiful, fair, his appearance was greeted with a low hum of admiration and anxiety. Half the audience had not known so grand a youth had lived among them. No wonder the princess loved him! What a terrible thing for him to be there!",
    "img": null,
    "audio": null
   },
   {
    "text": "As the youth advanced into the arena he turned, as the custom was, to bow to the king, but he did not think at all of that royal personage. His eyes were fixed upon the princess, who sat to the right of her father. Had it not been for the moiety of barbarism in her nature it is probable that lady would not have been there, but her intense and fervid soul would not allow her to be absent on an occasion in which she was so terribly interested. From the moment that the decree had gone forth that her lover should decide his fate in the king's arena, she had thought of nothing, night or day, but this great event and the various subjects connected with it.",
    "img": null,
    "audio": null
   },
   {
    "text": "Possessed of more power, influence, and force of character than any one who had ever before been interested in such a case, she had done what no other person had done,--she had possessed herself of the secret of the doors. She knew in which of the two rooms, that lay behind those doors, stood the cage of the tiger, with its open front, and in which waited the lady. Through these thick doors, heavily curtained with skins on the inside, it was impossible that any noise or suggestion should come from within to the person who should approach to raise the latch of one of them. But gold, and the power of a woman's will, had brought the secret to the princess.",
    "img": null,
    "audio": null
   },
   {
    "text": "And not only did she know in which room stood the lady ready to emerge, all blushing and radiant, should her door be opened, but she knew who the lady was. It was one of the fairest and loveliest of the damsels of the court who had been selected as the reward of the accused youth, should he be proved innocent of the crime of aspiring to one so far above him; and the princess hated her. Often had she seen, or imagined that she had seen, this fair creature throwing glances of admiration upon the person of her lover, and sometimes she thought these glances were perceived, and even returned. Now and then she had seen them talking together; it was but for a moment or two, but much can be said in a brief space; it may have been on most unimportant topics, but how could she know that? The girl was lovely, but she had dared to raise her eyes to the loved one of the princess; and, with all the intensity of the savage blood transmitted to her through long lines of wholly barbaric ancestors, she hated the woman who blushed and trembled behind that silent door.",
    "img": null,
    "audio": null
   },
   {
    "text": "When her lover turned and looked at her, and his eye met hers as she sat there, paler and whiter than any one in the vast ocean of anxious faces about her, he saw, by that power of quick perception which is given to those whose souls are one, that she knew behind which door crouched the tiger, and behind which stood the lady. He had expected her to know it. He understood her nature, and his soul was assured that she would never rest until she had made plain to herself this thing, hidden to all other lookers-on, even to the king. The only hope for the youth in which there was any element of certainty was based upon the success of the princess in discovering this mystery; and the moment he looked upon her, he saw she had succeeded, as in his soul he knew she would succeed.",
    "img": null,
    "audio": null
   },
   {
    "text": "Then it was that his quick and anxious glance asked the question: \"Which?\" It was as plain to her as if he shouted it from where he stood. There was not an instant to be lost. The question was asked in a flash; it must be answered in another. Her right arm lay on the cushioned parapet before her. She raised her hand, and made a slight, quick movement toward the right. No one but her lover saw her. Every eye but his was fixed on the man in the arena.",
    "img": null,
    "audio": null
   },
   {
    "text": "He turned, and with a firm and rapid step he walked across the empty space. Every heart stopped beating, every breath was held, every eye was fixed immovably upon that man. Without the slightest hesitation, he went to the door on the right, and opened it. Now, the point of the story is this: Did the tiger come out of that door, or did the lady? The more we reflect upon this question, the harder it is to answer. It involves a study of the human heart which leads us through devious mazes of passion, out of which it is difficult to find our way. Think of it, fair reader, not as if the decision of the question depended upon yourself, but upon that hot-blooded, semi-barbaric princess, her soul at a white heat beneath the combined fires of despair and jealousy. She had lost him, but who should have him?",
    "img": null,
    "audio": null
   },
   {
    "text": "How often, in her waking hours and in her dreams, had she started in wild horror, and covered her face with her hands as she thought of her lover opening the door on the other side of which waited the cruel fangs of the tiger!",
    "img": null,
    "audio": null
   },
   {
    "text": "But how much oftener had she seen him at the other door! How in her grievous reveries had she gnashed her teeth, and torn her hair, when she saw his start of rapturous delight as he opened the door of the lady! How her soul had burned in agony when she had seen him rush to meet that woman, with her flushing cheek and sparkling eye of triumph; when she had seen him lead her forth, his whole frame kindled with the joy of recovered life; when she had heard the glad shouts from the multitude, and the wild ringing of the happy bells; when she had seen the priest, with his joyous followers, advance to the couple, and make them man and wife before her very eyes; and when she had seen them walk away together upon their path of flowers, followed by the tremendous shouts of the hilarious multitude, in which her one despairing shriek was lost and drowned!",
    "img": null,
    "audio": null
   },
   {
    "text": "Would it not be better for him to die at once, and go to wait for her in the blessed regions of semi-barbaric futurity? And yet, that awful tiger, those shrieks, that blood! Her decision had been indicated in an instant, but it had been made after days and nights of anguished deliberation. She had known she would be asked, she had decided what she would answer, and, without the slightest hesitation, she had moved her hand to the right. The question of her decision is one not to be lightly considered, and it is not for me to presume to set myself up as the one person able to answer it. And so I leave it with all of you: Which came out of the opened door,--the lady, or the tiger?",
    "img": null,
    "audio": null
   }
  ]
 }
];
