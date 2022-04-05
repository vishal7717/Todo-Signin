let taskNode = document.getElementsByClassName("task");
let taskContainerNode = document.getElementById("taskContainer");

window.onclick = function (event) {
    if (event.target.className === "check") {
        let clickedId = event.target.id;
        let editTaskNode = document.getElementById(clickedId);

        // console.log(editTaskNode.checked)
        let value;
        if (editTaskNode.hasAttribute("checked")) {
            editTaskNode.removeAttribute("checked");
            value = false;
        }
        else {
            editTaskNode.setAttribute("checked", "checked");
            value = true;
        }

        let payload = {
            id: clickedId.substring(1),
            value: value
        }
        let request = new XMLHttpRequest;
        request.open("POST", "/check");
        request.setRequestHeader("Content-type", "application/json");
        request.send(JSON.stringify(payload));
        request.addEventListener("load", () => {
            console.log("Done")
        })
    }
}


