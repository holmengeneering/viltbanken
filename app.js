const homeView = document.getElementById("homeView");
const addView = document.getElementById("addView");

const addItemBtn = document.getElementById("addItemBtn");
const cancelBtn = document.getElementById("cancelBtn");

const dateInput = document.getElementById("dateInput");


// Öppna registreringssidan
addItemBtn.addEventListener("click", function () {

    homeView.classList.add("hidden");
    addView.classList.remove("hidden");

    // Sätt dagens datum automatiskt
    const today = new Date().toISOString().split("T")[0];
    dateInput.value = today;

});


// Gå tillbaka till startsidan
cancelBtn.addEventListener("click", function () {

    addView.classList.add("hidden");
    homeView.classList.remove("hidden");

});

const unitInput = document.getElementById("unitInput");
const packageWeightGroup = document.getElementById("packageWeightGroup");

function updatePackageWeightVisibility() {

    if (unitInput.value === "package") {
        packageWeightGroup.classList.remove("hidden");
    } else {
        packageWeightGroup.classList.add("hidden");
    }

}

unitInput.addEventListener("change", updatePackageWeightVisibility);

updatePackageWeightVisibility();

const saveItemBtn = document.getElementById("saveItemBtn");

const sourceInput = document.getElementById("sourceInput");
const labelInput = document.getElementById("labelInput");
const amountInput = document.getElementById("amountInput");
const packageWeightInput = document.getElementById("packageWeightInput");
const packageWeightUnit = document.getElementById("packageWeightUnit");
const locationInput = document.getElementById("locationInput");


// Hämta tidigare sparade varor
let freezerItems =
    JSON.parse(localStorage.getItem("viltbankenItems")) || [];


// Spara ny vara
saveItemBtn.addEventListener("click", function () {

    const source = sourceInput.value.trim();
    const label = labelInput.value.trim();
    const amount = Number(amountInput.value);
    const unit = unitInput.value;
    const location = locationInput.value.trim();
    const date = dateInput.value;

if (!source || !Number.isFinite(amount) || amount <= 0) {
    alert("Fyll i djur/råvara och en giltig mängd.");
    return;
}
    const item = {
        id: Date.now(),
        source: source,
        label: label,
        amount: amount,
        unit: unit,
        location: location,
        date: date
    };


    // Om enheten är paket sparar vi även vikt per paket
    if (unit === "package") {

        const packageWeight = Number(packageWeightInput.value);

        if (packageWeight > 0) {
            item.packageWeight = packageWeight;
            item.packageWeightUnit = packageWeightUnit.value;
        }

    }


    freezerItems.push(item);

    localStorage.setItem(
        "viltbankenItems",
        JSON.stringify(freezerItems)
    );
    updateOverview();

    
document.getElementById("saveConfirmation").classList.remove("hidden");

sourceInput.addEventListener("input", function () {
    document.getElementById("saveConfirmation").classList.add("hidden");
});


    // Töm formuläret
    sourceInput.value = "";
    labelInput.value = "";
    amountInput.value = "";
    packageWeightInput.value = "500";
    locationInput.value = "Frys";
    
document.querySelectorAll(".suggestion-btn.selected").forEach(function (button) {
    button.classList.remove("selected");
});


});

const inventoryBtn = document.getElementById("inventoryBtn");
const inventoryView = document.getElementById("inventoryView");
const inventoryList = document.getElementById("inventoryList");
const backHomeBtn = document.getElementById("backHomeBtn");


inventoryBtn.addEventListener("click", function () {

    homeView.classList.add("hidden");
    inventoryView.classList.remove("hidden");

    renderInventory();

});


backHomeBtn.addEventListener("click", function () {

    inventoryView.classList.add("hidden");
    homeView.classList.remove("hidden");

});


function renderInventory() {

    inventoryList.innerHTML = "";

    if (freezerItems.length === 0) {

        inventoryList.innerHTML = `
            <div class="empty-freezer">
                Frysen är tom.
            </div>
        `;

        return;
    }

// Gruppera likadana varor
const groupedItems = {};

// Lägg varje vara i rätt grupp
freezerItems.forEach(function (item) {

    const key = [
        item.source.trim().toLowerCase(),
        (item.label || "").trim().toLowerCase(),
        item.unit,
        (item.location || "").trim().toLowerCase()
    ].join("|");

    if (!groupedItems[key]) {
        groupedItems[key] = [];
    }

    groupedItems[key].push(item);

});




    Object.values(groupedItems).forEach(function (group) {

    const item = group[0];

    // Räkna ihop mängden i gruppen
    const totalAmount = group.reduce(function (sum, entry) {
        return sum + Number(entry.amount);
    }, 0);

    let amountText = "";


        // Paket
if (item.unit === "package") {

    amountText = `${totalAmount} paket`;

    let totalKg = 0;
    let totalLiters = 0;

    group.forEach(function (entry) {

        if (entry.packageWeight) {

            const amount = Number(entry.amount);
            const quantity = Number(entry.packageWeight);

            if (entry.packageWeightUnit === "g") {
                totalKg += amount * quantity / 1000;
            }

            else if (entry.packageWeightUnit === "kg") {
                totalKg += amount * quantity;
            }

            else if (entry.packageWeightUnit === "dl") {
                totalLiters += amount * quantity / 10;
            }

            else if (entry.packageWeightUnit === "liter") {
                totalLiters += amount * quantity;
            }
        }

    });

    if (totalKg > 0) {
        amountText +=
            ` · ${totalKg.toLocaleString("sv-SE", {
                maximumFractionDigits: 2
            })} kg totalt`;
    }

    if (totalLiters > 0) {
        amountText +=
            ` · ${totalLiters.toLocaleString("sv-SE", {
                maximumFractionDigits: 2
            })} liter totalt`;
    }

}

        // Stycken
else if (item.unit === "pcs") {
    amountText = `${totalAmount} st`;
}

// Kg
else if (item.unit === "kg") {
    amountText = `${totalAmount} kg`;
}

// Gram
else if (item.unit === "g") {
    amountText = `${totalAmount} g`;
}

// Liter
else if (item.unit === "liter") {
    amountText = `${totalAmount} liter`;
}


        const itemElement = document.createElement("div");

        const groupKey = [
    item.source.trim().toLowerCase(),
    (item.label || "").trim().toLowerCase(),
    item.unit,
    (item.location || "").trim().toLowerCase()
].join("|");

itemElement.dataset.groupKey = groupKey;

        itemElement.className = "inventory-item";


        itemElement.innerHTML = `
    <details>
        <summary>
            <h3>${item.source}</h3>

            ${item.label ? `<div class="item-label">${item.label}</div>` : ""}

            <p>${amountText}</p>

            ${item.location ? `<p>📍 ${item.location}</p>` : ""}
        </summary>

        <div class="group-details">
            <p><strong>Registreringar:</strong></p>

            ${group.map(function (entry) {

                let entryText = `${entry.amount}`;

if (entry.unit === "package") {

    entryText += " paket";

    if (entry.packageWeight) {

        const amount = Number(entry.amount);
        const quantity = Number(entry.packageWeight);
        const unit = entry.packageWeightUnit;

        if (unit === "g" || unit === "kg") {

            const totalKg = unit === "g"
                ? amount * quantity / 1000
                : amount * quantity;

            entryText += ` · ${totalKg.toLocaleString("sv-SE", {
                maximumFractionDigits: 2
            })} kg`;
        }

        else if (unit === "dl" || unit === "liter") {

            const totalLiters = unit === "dl"
                ? amount * quantity / 10
                : amount * quantity;

            entryText += ` · ${totalLiters.toLocaleString("sv-SE", {
                maximumFractionDigits: 2
            })} liter`;
        }

        entryText += ` (${entry.packageWeight} ${unit}/st)`;
    }



} else if (entry.unit === "pcs") {
    entryText += " st";
} else if (entry.unit === "kg") {
    entryText += " kg";
} else if (entry.unit === "g") {
    entryText += " g";
} else if (entry.unit === "liter") {
    entryText += " liter";
}

                return `
    <div class="group-entry">
        <div class="entry-info">
            <strong>${entryText}</strong>
            ${entry.date ? `<small>📅 ${entry.date}</small>` : ""}
        </div>

        <button
            class="withdraw-btn"
            type="button"
            data-item-id="${entry.id}"
        >
            Ta ut
        </button>
    </div>
`;

            }).join("")}
        </div>
    </details>
`;

            /*
        withdrawButton.addEventListener("click", function () {

    const amountToWithdraw = prompt(
        "Hur mycket vill du ta ut av " +
        item.source + " – " + item.label +
        "?\nFinns i frysen: " + item.amount
    );

    if (amountToWithdraw === null) {
        return;
    }

    const quantity = Number(amountToWithdraw.trim().replace(",", "."));

    if (
        !Number.isFinite(quantity) ||
        quantity <= 0 ||
        quantity > Number(item.amount) ||
        (["package", "pcs"].includes(item.unit) && !Number.isInteger(quantity))
    ) {
        alert("Ange en giltig mängd som inte överstiger lagersaldot.");
        return;
    }

    item.amount = Number(item.amount) - quantity;

if (item.amount === 0) {
    freezerItems = freezerItems.filter(
        freezerItem => freezerItem !== item
    );
}

localStorage.setItem(
    "viltbankenItems",
    JSON.stringify(freezerItems)
);

renderInventory();
updateOverview();
});
*/

        inventoryList.appendChild(itemElement);

    // Koppla Ta ut-knapparna till rätt registrering
itemElement.querySelectorAll(".withdraw-btn").forEach(function (button) {

    button.addEventListener("click", function () {

        const itemId = Number(button.dataset.itemId);

        const selectedItem = freezerItems.find(function (entry) {
            return entry.id === itemId;
        });

        if (!selectedItem) {
            alert("Varan kunde inte hittas.");
            return;
        }

        const amountToWithdraw = prompt(
            "Hur mycket vill du ta ut?\nFinns: " +
            selectedItem.amount
        );

        if (amountToWithdraw === null) {
            return;
        }

        const quantity = Number(
            amountToWithdraw.trim().replace(",", ".")
        );

        if (
            !Number.isFinite(quantity) ||
            quantity <= 0 ||
            quantity > Number(selectedItem.amount) ||
            (["package", "pcs"].includes(selectedItem.unit) &&
                !Number.isInteger(quantity))
        ) {
            alert("Ange en giltig mängd.");
            return;
        }

        selectedItem.amount -= quantity;

        if (selectedItem.amount === 0) {
            freezerItems = freezerItems.filter(function (entry) {
                return entry !== selectedItem;
            });
        }

        localStorage.setItem(
            "viltbankenItems",
            JSON.stringify(freezerItems)
        );

                const openGroupKey = itemElement.dataset.groupKey;

renderInventory();
updateOverview();

const groupToOpen = Array.from(
    inventoryList.querySelectorAll(".inventory-item")
).find(function (element) {
    return element.dataset.groupKey === openGroupKey;
});

if (groupToOpen) {
    const details = groupToOpen.querySelector("details");

    if (details) {
        details.open = true;
    }
}

    }); // Avslutar klickfunktionen

}); // Avslutar knapparnas forEach

}); // Avslutar gruppernas forEach

} // Avslutar renderInventory
// -------------------------
// SJÄLVLÄRANDE SNABBKNAPPAR
// -------------------------

const sourceSuggestions =
    document.getElementById("sourceSuggestions");

const labelSuggestions =
    document.getElementById("labelSuggestions");


// Skapa snabbknappar
function createSuggestionButtons(container, values, input, onSelect) {

    container.innerHTML = "";

    values.forEach(function (value) {

        const button = document.createElement("button");

        button.type = "button";
        button.className = "suggestion-btn";
        button.textContent = value;

        button.addEventListener("click", function () {
    input.value = value;

    document.getElementById("saveConfirmation").classList.add("hidden");

    container.querySelectorAll(".suggestion-btn").forEach(function (btn) {
        btn.classList.remove("selected");
    });

    button.classList.add("selected");

    if (onSelect) {
        onSelect();
    }
});

        container.appendChild(button);

    });

}


// Visa tidigare använda råvaror
function updateSourceSuggestions() {

    const sources = [
        ...new Map(
            freezerItems
                .filter(item => item.source && item.source.trim())
                .map(item => [
                    item.source.trim().toLowerCase(),
                    item.source.trim()
                ])
        ).values()
    ];

    createSuggestionButtons(
        sourceSuggestions,
        sources,
        sourceInput,
        updateLabelSuggestions
    );

}


// Visa etiketter för vald råvara
function updateLabelSuggestions() {

    const selectedSource =
        sourceInput.value.trim().toLowerCase();

    const labels = [
    ...new Map(
        freezerItems
            .filter(item =>
                item.source.trim().toLowerCase() === selectedSource
            )
            .filter(item => item.label && item.label.trim())
            .map(item => [
                item.label.trim().toLowerCase(),
                item.label.trim()
            ])
    ).values()
];

    createSuggestionButtons(
        labelSuggestions,
        labels,
        labelInput
    );

}


// Uppdatera etiketter när råvaran ändras
sourceInput.addEventListener(
    "input",
    updateLabelSuggestions
);


// Uppdatera knapparna när registreringen öppnas
addItemBtn.addEventListener("click", function () {

    updateSourceSuggestions();
    updateLabelSuggestions();

});

// -------------------------
// SNABBKNAPPAR FÖR FRYSPLATS
// -------------------------

const locationSuggestions =
    document.getElementById("locationSuggestions");

function updateLocationSuggestions() {

    const locations = [
        ...new Map(
            freezerItems
                .map(item => item.location)
                .filter(location => location && location.trim())
                .map(location => [
                    location.trim().toLowerCase(),
                    location.trim()
                ])
        ).values()
    ];

    createSuggestionButtons(
        locationSuggestions,
        locations,
        locationInput
    );

}

// Uppdatera när registreringen öppnas
addItemBtn.addEventListener("click", function () {
    updateLocationSuggestions();
});

function updateOverview() {

    const totalItems = document.getElementById("totalItems");
    const totalWeight = document.getElementById("totalWeight");

    totalItems.textContent = freezerItems.length;

    let weightKg = 0;

    freezerItems.forEach(function (item) {

        const amount = Number(item.amount);

        if (item.unit === "kg") {
            weightKg += amount;
        }

        else if (item.unit === "g") {
            weightKg += amount / 1000;
        }

        else if (item.unit === "package" && item.packageWeight) {

            const packageWeight = Number(item.packageWeight);

            if (item.packageWeightUnit === "g") {
                weightKg += amount * packageWeight / 1000;
                } else if (item.packageWeightUnit === "kg") {
                weightKg += amount * packageWeight;
            }

        }

            }); // Avslutar viktberäkningen

    let volumeLiters = 0;

    freezerItems.forEach(function (item) {

        const amount = Number(item.amount);

        if (item.unit === "liter") {
            volumeLiters += amount;
        }

        else if (item.unit === "package" && item.packageWeight) {

            const packageVolume = Number(item.packageWeight);

            if (item.packageWeightUnit === "liter") {
                volumeLiters += amount * packageVolume;
            }

            else if (item.packageWeightUnit === "dl") {
                volumeLiters += amount * packageVolume / 10;
            }
        }

    });

    const totalVolume = document.getElementById("totalVolume");

    totalVolume.textContent =
        volumeLiters.toLocaleString("sv-SE", {
            maximumFractionDigits: 2
        }) + " l";

    totalWeight.textContent =
        weightKg.toLocaleString("sv-SE", {
            maximumFractionDigits: 2
        }) + " kg";

}

updateOverview();