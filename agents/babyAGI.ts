import { IConfig } from "../interfaces.ts";
import { Sapial } from "../sapial.ts";

const config: IConfig = {
 name: "BabyAGI",
 primaryModel: "gpt-4",
 secondaryModel: "gpt-4",
 memory: true,
}

const sapial = new Sapial(config);
const objective = "Solve world hunger";
const babyAGI = sapial.spawnAgent(config, objective)
console.log('result', babyAGI)

// This is the response with shortned prompts
// World hunger is a global problem that affects millions of people across the planet. According to the United Nations, around 690 million people, or nearly 9% of the world's population, suffer from chronic hunger. This means they do not have enough food to lead a healthy, active life.
// The problem is most severe in Africa, where nearly 20% of the population is undernourished. However, it is also a significant issue in Asia, Latin America, and other parts of the world.
// World hunger is not just about lack of food. It is also closely linked to poverty, inequality, and lack of access to resources and opportunities. It affects people's health, education, and ability to work, and can trap individuals and communities in a cycle of poverty and hunger.
// Furthermore, world hunger is a complex problem that is influenced by a range of factors, including climate change, conflict, and economic instability. It requires coordinated, long-term solutions that address these underlying issues.
// In addition, the COVID-19 pandemic has exacerbated the problem of world hunger, with an estimated 130 million more people facing chronic hunger due to the economic impact of the virus.
// In conclusion, the scope of the world hunger problem is vast, affecting millions of people across the globe and requiring urgent, coordinated action to address it., Step2 - Global food production and distribution are complex systems that involve a wide range of factors, from agricultural practices and climate change to trade policies and market dynamics. Here is some data and information on the current state of global food production and distribution:
// 1. Global Food Production:
// - According to the Food and Agriculture Organization (FAO) of the United Nations, the world produces enough food to feed everyone, with over 2.5 billion tonnes of cereals produced annually (FAO, 2020).
// - Asia is the largest producer of cereals, accounting for over 90% of global rice production and about half of the world's wheat and coarse grains (FAO, 2020).
// - The Americas, particularly the United States and Brazil, are the largest producers of soybeans, maize, and other coarse grains (FAO, 2020).
// - Africa, despite having a large agricultural potential, produces only about 10% of the world's cereals (FAO, 2020).
// 2. Global Food Distribution:
// - Despite the abundance of food, its distribution is highly unequal. According to the World Food Programme, 690 million people, or nearly 9% of the world's population, were undernourished in 2019.
// - The majority of the world's hungry people live in Asia (381 million) and Africa (250 million) (FAO, 2020).
// - Conflict, climate variability and extremes, and economic slowdowns and downturns are the main drivers of food insecurity and malnutrition (FAO, 2020).
// - Food waste is a significant issue, with roughly one-third of the food produced in the world for human consumption every year — approximately 1.3 billion tonnes — getting lost or wasted (FAO, 2019).
// 3. Impact of COVID-19:
// - The COVID-19 pandemic has exacerbated food insecurity and disrupted food supply chains. According to the World Bank, an additional 88 million to 115 million people were pushed into extreme poverty in 2020 due to the pandemic.
// - The pandemic has also highlighted the vulnerability of global food systems to shocks and stresses. It has underscored the need for more resilient, sustainable, and equitable food systems.
// Sources:
// - FAO. (2020). The State of Food Security and Nutrition in the World 2020. Rome.
// - FAO. (2019). Global Food Losses and Food Waste. Rome.
// - World Bank. (2020). Poverty and Shared Prosperity 2020: Reversals of Fortune. Washington, DC.,