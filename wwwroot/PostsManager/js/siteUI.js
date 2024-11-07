//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderPosts();
    $('#createPosts').on("click", async function () {
        saveContentScrollPosition();
        renderCreatePostsForm();
    });
    $('#abort').on("click", async function () {
        renderPosts();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createPosts").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de Posts</h2>
                <hr>
                <p>
                    Petite application de gestion de Posts à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Nicolas Chourot
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function renderPosts() {
    showWaitingGif();
    $("#actionTitle").text("Liste des Posts");
    $("#createPosts").show();
    $("#abort").hide();
    let Posts = await API_GetPosts();
    eraseContent();
    if (Posts !== null) {
        Posts.forEach(posts => {
            $("#content").append(renderPost(posts));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditPostsForm($(this).attr("editPostsId"));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeletePostsForm($(this).attr("deletePostsId"));
        });
        $(".postsRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    eraseContent();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreatePostsForm() {
    renderPostsForm();
}
async function renderEditPostsForm(id) {
    showWaitingGif();
    let posts = await API_GetPosts(id);
    if (posts !== null)
        renderPostsForm(posts);
    else
        renderError("Posts introuvable!");
}
async function renderDeletePostsForm(id) {
    showWaitingGif();
    $("#createPosts").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let posts = await API_GetPosts(id);
    eraseContent();
    if (posts !== null) {
        $("#content").append(`
        <div class="postsdeleteForm">
            <h4>Effacer le posts suivant?</h4>
            <br>
            <div class="postsRow" posts_id=${posts.Id}">
                <div class="postsContainer">
                    <div class="postsLayout">
                        <div class="postsName">${posts.Name}</div>
                        <div class="postsPhone">${posts.Phone}</div>
                        <div class="postsEmail">${posts.Email}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deletePosts" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deletePosts').on("click", async function () {
            showWaitingGif();
            let result = await API_DeletePosts(posts.Id);
            if (result)
                renderPosts();
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderPosts();
        });
    } else {
        renderError("Posts introuvable!");
    }
}
function newPosts() {
    posts = {};
    posts.Id = 0;
    posts.Title = "";
    posts.Phone = "";
    posts.Email = "";
    return posts;
}
function renderPostsForm(posts = null) {
    $("#createPosts").hide();
    $("#abort").show();
    eraseContent();
    let create = posts == null;
    if (create) {
        posts = newPosts();
        posts.Avatar = "images/no-avatar.png";
    }
    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="postsForm">
            <input type="hidden" name="Id" value="${posts.Id}"/>

            <label for="Name" class="form-label">Nom </label>
            <input 
                class="form-control Alpha"
                name="Name" 
                id="Name" 
                placeholder="Nom"
                required
                RequireMessage="Veuillez entrer un nom"
                InvalidMessage="Le nom comporte un caractère illégal" 
                value="${posts.Title}"
            />
            <label for="Text" class="form-label">Texte </label>
            <input
                class="form-control Alpha"
                name="Text"
                id="Text"
                placeholder="text
                required
                RequireMessage="Veuillez entrer le texte" 
                InvalidMessage="Veuillez entrer un texte valide"
                value="${posts.Text}" 
            />
            <label for="Email" class="form-label">Courriel </label>
            <input 
                class="form-control Email"
                name="Email"
                id="Email"
                placeholder="Courriel"
                required
                RequireMessage="Veuillez entrer votre courriel" 
                InvalidMessage="Veuillez entrer un courriel valide"
                value="${posts.Category}"
            />
            <!-- nécessite le fichier javascript 'imageControl.js' -->
            <label class="form-label">Avatar </label>
            <div   class='imageUploader' 
                   newImage='${create}' 
                   controlId='Avatar' 
                   imageSrc='${posts.Image}' 
                   waitingImage="Loading_icon.gif">
            </div>
            <hr>
            <input type="submit" value="Enregistrer" id="savePosts" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initImageUploaders();
    initFormValidation(); // important do to after all html injection!
    $('#postsForm').on("submit", async function (event) {
        event.preventDefault();
        let posts = getFormData($("#postsForm"));
        showWaitingGif();
        let result = await API_SavePosts(posts, create);
        if (result)
            renderPosts();
        else
            renderError("Une erreur est survenue! " + API_getcurrentHttpError());
    });
    $('#cancel').on("click", function () {
        renderPosts();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderPost(posts) {
    console.log(posts)
    return $(`
     <div class="postsRow" posts_id=${posts.Id}">
        <div class="postsContainer noselect">
            <div class="postsLayout">
                 <div class="postsInfo">
                    <h1">${posts.Title}</h1>
                    <p>${posts.Category}</p>
                    <p>${posts.Text}</p>
                </div>
            </div>
        </div>
    </div>           
    `);
}