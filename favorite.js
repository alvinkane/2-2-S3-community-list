const userCard = document.querySelector("#user-card");
const userInfo = document.querySelector("#user-info");

const userName = document.querySelector("#user-name");
const userImg = document.querySelector("#user-img");
const userDetail = document.querySelector("#user-detail");

const favoriteUsers = JSON.parse(localStorage.getItem("favorite")) || [];
const favoriteUsersDetail =
  JSON.parse(localStorage.getItem("favoriteDetail")) || [];

// 分頁數量
const pageAmount = 21;

// pagination
const pagination = document.querySelector("#pagination");

// 建立初始介面
function renderUserList(data) {
  let rawHtml = "";
  data.forEach((list) => {
    // 如果資料有問題則不建立
    if (Object.values(list).some((value) => !value)) return;
    rawHtml += `<div class="card mb-2 ms-2 position-relative" style="width: 10rem;">
      <img src="${list.avatar}" class="card-img card-img-top" alt="..." data-bs-toggle="modal" data-bs-target="#img-modal" data-id = ${list.id}>
      <div class="card-body d-flex">
        <p class="card-text">${list.name} ${list.surname}</p>
      </div>
      <a href="#" class="btn btn-danger btn-sm position-absolute top-0 end-0" data-id = ${list.id}>X</a>
    </div>`;
  });
  userCard.innerHTML = rawHtml;
}

// 建立showmodal的介面
function renderShowModal(id) {
  const user = favoriteUsersDetail.find((user) => user.id === id);
  userName.textContent = user.name + " " + user.surname;
  userImg.innerHTML = `<img src="${user.avatar}" alt="img">`;
  userDetail.innerHTML = `
      <p>email : ${user.email}</p>
      <p>gender : ${user.gender}</p>
      <p>age : ${user.age}</p>
      <p>region : ${user.region}</p>
      <p>birthday : ${user.birthday}</p>
    `;
}

// 計算分頁的頁數，產生相應數量的分頁碼
function renderPagination(data) {
  //計算頁碼數量(200 / 21 = 9 ... 11 -> 10)
  const page = Math.ceil(data.length / pageAmount);
  let rawHTML = "";
  for (let i = 1; i <= page; i++) {
    rawHTML += `
      <li class="page-item"><a class="page-link" href="#" data-page='${i}'>${i}</a></li>
    `;
  }
  pagination.innerHTML = rawHTML;
}

// 根據頁數渲染頁面
function renderPage(page) {
  // 根據選的頁數，利用slice區分data的範圍(0-20、21-41)
  const startIndex = (page - 1) * pageAmount;
  const endIndex = startIndex + pageAmount;
  return favoriteUsers.slice(startIndex, endIndex);
}

// 將localStorage資料刪除
function removeFromLocalStorage(id) {
  // 取的此id所在陣列的位置
  const index = favoriteUsers.findIndex((user) => user.id === id);
  // 移除該項目
  favoriteUsers.splice(index, 1);
  // 將資料丟至localStorage
  localStorage.setItem("favorite", JSON.stringify(favoriteUsers));
  // 重新渲染
  renderUserList(favoriteUsers);
}

//統一在card做
userCard.addEventListener("click", function cardClicked(event) {
  //按img時會顯示詳細資料
  if (event.target.tagName === "IMG") {
    renderShowModal(Number(event.target.dataset.id));
    // 按+時，會將數據存在localstorage
  } else if (event.target.tagName === "A") {
    removeFromLocalStorage(Number(event.target.dataset.id));
  }
});

// 設置監聽器，切換頁數時，重新渲染
pagination.addEventListener("click", function onClickedPage(event) {
  const target = event.target;
  const page = event.target.dataset.page;
  let userListSlice = [];
  if (target.tagName !== "A") return;
  renderUserList(renderPage(page));
});

renderUserList(renderPage(1));
renderPagination(favoriteUsers);
