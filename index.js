let inventory = {
    "mochila": {
        name: "Mochila",
        quantity: 1,
        unitWeight: 1
    }
}

let itemJsonPaths = [
    { name: "Itens e Serviços",    path: "data/itens-e-serviços.json" },
    { name: "Armas simples",       path: "data/armas-simples.json" },
    { name: "Armas marciais",      path: "data/armas-marciais.json" },
    { name: "Armas exóticas",      path: "data/armas-exóticas.json" },
    { name: "Armaduras e escudos", path: "data/armaduras-e-escudos.json" }
]

let slugify = function(text) {
    return text
        .toLowerCase()
        .replace(/ /g,'-')
        .replace(/[^\w-]+/g,'')
}

let refreshInventory = function() {
    let total = 0
    let itens = []

    Object.keys(inventory).sort().forEach(item => {
        if (inventory[item].quantity == 0) return // don't display it

        total += inventory[item].quantity * inventory[item].unitWeight

        let newItem = $("#invItemTemplate").html()
        newItem = newItem.split("${invItemName}").join(inventory[item].name)
        newItem = newItem.split("${invItemUnitWeight}").join(inventory[item].unitWeight)
        newItem = newItem.split("${invItemQuantity}").join(inventory[item].quantity)
        itens.push(newItem)
    })
    
    $("#inventoryWeight").text(total)
    $("#invItens").html(itens.join(" "))
}

let appendJsonToPage = function(title, content) {
    let $container = $("#itens")

    let newTitle = $("#titleTemplate").html()
    newTitle = newTitle.replace("${title}", title)
    $container.append($.parseHTML(newTitle))

    Object.keys(content).forEach(category => {
        let newCategory = $("#categoryTemplate").html()
        newCategory = newCategory.replace("${category}", category)
        $container.append($.parseHTML(newCategory))

        content[category].forEach(item => {
            let newItem = $("#itemTemplate").html()
            let itemID = slugify(item.item)
            newItem = newItem.split("${itemName}").join(item.item)
            newItem = newItem.split("${itemWeight}").join(item.peso)
            newItem = newItem.split("${itemNameSlug}").join(itemID)
            newItem = newItem.split("${itemValue}").join(inventory[itemID] ? inventory[itemID].quantity+"" : "0")

            let $newItem = $($.parseHTML(newItem))
            $newItem.on('change', function(ev) {
                inventory[ev.target.id] = inventory[ev.target.id] || {}
                inventory[ev.target.id].quantity = ev.target.valueAsNumber
                inventory[ev.target.id].name = ev.currentTarget.dataset["name"] 
                inventory[ev.target.id].unitWeight = ev.currentTarget.dataset["weight"]

                refreshInventory()
            })
            $container.append($newItem)
        })
    })
}

$(function(){
    itemJsonPaths.forEach(p => {
        $.ajax(p.path, {
            success: result => {
                appendJsonToPage(p.name, result)
                refreshInventory()
            },
            error: console.warn
        })

    })
})