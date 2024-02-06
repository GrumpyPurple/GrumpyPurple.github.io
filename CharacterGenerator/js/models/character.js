class Character {
    constructor() {
        this.firstName = "";
        this.lastName = "";

        this.race = "";
        this.class = "";
        this.background = "";
        this.age = "";
        this.height = "";
        this.weight = "";

        this.abilities = [];
        ABILITIES.forEach(ability => {
            this.abilities.push(new Ability(ability));
        });
    }

    generateCharacter() {
        this.selectedFirstName = this.generateName();
        this.selectedLastName = randomArrayValue(model.lastNames);

        this.selectedRace = randomArrayValue(this.races);
        this.selectedClass = randomArrayValue(this.classes);
        this.selectedBackground = randomArrayValue(this.backgrounds);
        this.selectedAge = 10 * weightedRandom([2, 3, 4, 5, 6, 7, 8, 9], [128, 64, 32, 16, 8, 4, 2, 1]) + getRandomNumber(0, 9);
        this.selectedHeight = `${getRandomNumber(heightFeetMinimum, heightFeetMaximum)}ft ${getRandomNumber(0, 11)}inches`;
        this.selectedWeight = `${getRandomNumber(weightKiloMinimum, weightKiloMaximum)}kgs`;

        this.abilityScores = this.generateAbilityScores();
    }

    generateAbilityScores() {
        //set abilities to minimum
        this.abilities.forEach((ability) => {
            ability.value = abilityScoreMinimum;
        });

        //set the remaining score to total MINUS minimums assigned
        let remainingPoints = abilityScoreTotal - (abilityScoreMinimum * abilities.length);

        //select random ability, give it a point, subtract from remaining
        while (remainingPoints > 0) {
            const randomAbilityIndex = getRandomNumber(0, this.abilities.length - 1);
            const selectedAbility = this.abilities[randomAbilityIndex];

            if (selectedAbility.value < abilityScoreMaximum) {
                selectedAbility.value++;
                remainingPoints--;
            }
        }

        //Class & Race bonuses?
    }

    generateName() {
        const numberOfSyllables = weightedRandom([1, 2, 3, 4, 5], [5, 4, 3, 2, 1]);
        const syllables = Array.from({ length: numberOfSyllables }, () => randomArrayValue(this.nameSyllables));
        const name = syllables.join('');

        return name;
    }
}