class CharacterView {
    constructor() {
        this.characterSheetElement = document.getElementById("characterSheet");
        this.nameElement = document.getElementById("characterName");
        this.characterInfo = document.getElementById("characterInfo");
        this.raceElement = document.getElementById("characterRace");
        this.classElement = document.getElementById("characterClass");
        this.backgroundElement = document.getElementById("characterBackground");
        this.abilitiesElement = document.getElementById("characterAbilities");
    }

    animateRandomise() {
        this.characterSheetElement.classList.add('animate');

        // Remove animation class after animation completes
        setTimeout(() => {
            this.characterSheetElement.classList.remove('animate');
        }, 400); // Match animation duration
    }

    updateCharacterSheet(model) {
        this.nameElement.textContent = `${model.selectedFirstName} ${model.selectedLastName}`;
        this.printCharacterSheet(model);
        this.printAbilities(model.abilityScores);
        this.animateRandomise();
    }

    printCharacterSheet(model) {
        let tableHTML = '';

        tableHTML += `<tr><th>Race</th><td>${model.selectedRace}</td>`;
        tableHTML += `<tr><th>Class</th><td>${model.selectedClass}</td>`;
        tableHTML += `<tr><th>Background</th><td>${model.selectedBackground}</td>`;
        tableHTML += `<tr><th>Age</th><td>${model.selectedAge}</td>`;
        tableHTML += `<tr><th>Height</th><td>${model.selectedHeight}</td>`;
        //tableHTML += `<tr><th>Weight</th><td>${model.selectedWeight}</td>`;

        this.characterInfo.innerHTML = tableHTML;
    }

    printAbilities(abilityScores) {
        let tableHTML = '';
        //tableHTML += '<tr><th>Ability</th><th>Score</th></tr>';

        for (const ability in abilityScores) {
            tableHTML += `<tr><th>${ability}</th><td>${abilityScores[ability]}</td></tr>`;
        }

        tableHTML += '';
        this.abilitiesElement.innerHTML = tableHTML;
    }
};