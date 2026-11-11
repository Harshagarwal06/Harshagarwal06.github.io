// ---------- Demo 1: the 1,000-row cap (PMS Pro) ----------
// Illustrative numbers: 12 months of 1,000 rows each, newest month first.
// One request returns one month, so the capped page only ever sees December.
(function () {
  var MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  var ROWS_PER_PAGE = 1000;
  var THIS_MONTH = 8; // September
  var NOT_STARTED_THIS_MONTH = 140;
  var PAGE_DELAY_MS = 220;

  var status = document.getElementById("rows-status");
  var monthsBox = document.getElementById("rows-months");
  var log = document.getElementById("rows-log");
  var fetchButton = document.getElementById("rows-fetch");
  var resetButton = document.getElementById("rows-reset");

  var pagesLoaded;
  var timer = null;

  function render() {
    var firstLoadedMonth = MONTHS.length - pagesLoaded;
    monthsBox.textContent = "";
    MONTHS.forEach(function (name, index) {
      var month = document.createElement("div");
      month.className = "month";
      if (index >= firstLoadedMonth) month.classList.add("month--loaded");
      if (index === THIS_MONTH) month.classList.add("month--now");
      var bar = document.createElement("div");
      bar.className = "month__bar";
      month.appendChild(bar);
      month.appendChild(document.createTextNode(name));
      monthsBox.appendChild(month);
    });

    var thisMonthLoaded = THIS_MONTH >= firstLoadedMonth;
    if (thisMonthLoaded) {
      status.className = "status status--warn";
      status.textContent = NOT_STARTED_THIS_MONTH + " goals in Sep have not been started";
    } else {
      status.className = "status status--ok";
      status.textContent = "Nothing needs action in Sep";
    }

    var loaded = (pagesLoaded * ROWS_PER_PAGE).toLocaleString("en-US");
    var total = (MONTHS.length * ROWS_PER_PAGE).toLocaleString("en-US");
    if (pagesLoaded === 1) {
      log.textContent = "Rows loaded: " + loaded + ". Total: never checked. The page has no Sep rows at all, so it reports all clear.";
    } else if (pagesLoaded < MONTHS.length) {
      log.textContent = "Rows loaded: " + loaded + " of " + total + "...";
    } else {
      log.textContent = "Rows loaded: " + loaded + " of " + total + ". Duplicates: 0. Months present: 12.";
    }
    fetchButton.disabled = pagesLoaded > 1;
  }

  function fetchEveryPage() {
    if (timer !== null) return;
    timer = setInterval(function () {
      pagesLoaded += 1;
      render();
      if (pagesLoaded === MONTHS.length) {
        clearInterval(timer);
        timer = null;
      }
    }, PAGE_DELAY_MS);
  }

  function reset() {
    if (timer !== null) {
      clearInterval(timer);
      timer = null;
    }
    pagesLoaded = 1;
    render();
  }

  fetchButton.addEventListener("click", fetchEveryPage);
  resetButton.addEventListener("click", reset);
  reset();
})();

// ---------- Demo 2: token versions (DrawVault) ----------
// The account has a version number. A token is accepted only if it carries
// the same number. Changing the password raises the account's number and
// hands the device that made the change a fresh token.
(function () {
  var serverBox = document.getElementById("tok-server");
  var laptopBox = document.getElementById("tok-laptop");
  var phoneBox = document.getElementById("tok-phone");
  var log = document.getElementById("tok-log");
  var openButton = document.getElementById("tok-open");
  var changeButton = document.getElementById("tok-change");
  var resetButton = document.getElementById("tok-reset");

  var account;
  var laptop;
  var phone;
  var phoneSignedOut;

  function fillDevice(box, name, version, state, stale) {
    box.textContent = "";
    box.className = stale ? "device device--stale" : "device";
    [["device__name", name], ["device__version", "v" + version], ["device__state", state]].forEach(function (part) {
      var line = document.createElement("div");
      line.className = part[0];
      line.textContent = part[1];
      box.appendChild(line);
    });
  }

  function render(message) {
    fillDevice(serverBox, "Account", account, "current version", false);
    fillDevice(laptopBox, "Laptop token", laptop, "signed in", false);
    fillDevice(
      phoneBox,
      "Phone token",
      phone,
      phoneSignedOut ? "signed out" : phone === account ? "signed in" : "stale, not used yet",
      phone !== account
    );
    openButton.disabled = phoneSignedOut;
    log.textContent = message;
  }

  function openOnPhone() {
    if (phone === account) {
      render("Phone asks for a drawing with a v" + phone + " token. Account is on v" + account + ". Accepted.");
    } else {
      phoneSignedOut = true;
      render("Phone asks for a drawing with a v" + phone + " token. Account is on v" + account + ". Rejected, and the phone is signed out.");
    }
  }

  function changePassword() {
    account += 1;
    laptop = account;
    render("Password changed on the laptop. Account moves to v" + account + ". The laptop gets a fresh token; every older token is now stale.");
  }

  function reset() {
    account = 1;
    laptop = 1;
    phone = 1;
    phoneSignedOut = false;
    render("Both devices hold a v1 token, and the account is on v1.");
  }

  openButton.addEventListener("click", openOnPhone);
  changeButton.addEventListener("click", changePassword);
  resetButton.addEventListener("click", reset);
  reset();
})();

// ---------- Demo 3: chai vs tea (Photo Shopping) ----------
// The ranker counts how many search words appear in the product name.
// Ties go to the lower price.
(function () {
  var PRODUCTS = [
    { name: "Girnar Royal Cup Masala Chai Tea", pack: "250 g", price: 170 },
    { name: "Red Label Masala Instant Tea Premix", pack: "10 pcs", price: 99 }
  ];

  var toggle = document.getElementById("chai-toggle");
  var queryLine = document.getElementById("chai-query");
  var box = document.getElementById("chai-products");

  function render() {
    var query = toggle.checked ? "masala tea" : "masala chai";
    var words = query.split(" ");

    var scored = PRODUCTS.map(function (product) {
      var nameWords = product.name.toLowerCase().split(" ");
      var matched = words.filter(function (word) {
        return nameWords.indexOf(word) !== -1;
      });
      return { product: product, matched: matched };
    });

    var winner = scored.slice().sort(function (a, b) {
      return b.matched.length - a.matched.length || a.product.price - b.product.price;
    })[0];
    var tie = scored[0].matched.length === scored[1].matched.length;

    queryLine.textContent =
      'Search sent: "' + query + '". ' +
      (tie ? "Both products match every word, so the lower price wins." : "Only one product matches every word.");

    box.textContent = "";
    scored.forEach(function (entry) {
      var card = document.createElement("div");
      card.className = entry === winner ? "product product--winner" : "product";

      var name = document.createElement("div");
      name.className = "product__name";
      entry.product.name.split(" ").forEach(function (word, index) {
        if (index > 0) name.appendChild(document.createTextNode(" "));
        if (entry.matched.indexOf(word.toLowerCase()) !== -1) {
          var mark = document.createElement("mark");
          mark.textContent = word;
          name.appendChild(mark);
        } else {
          name.appendChild(document.createTextNode(word));
        }
      });

      var facts = document.createElement("div");
      facts.className = "product__facts";
      facts.textContent =
        entry.product.pack + " · ₹" + entry.product.price + " · matches " +
        entry.matched.length + " of " + words.length + " words";

      var badge = document.createElement("div");
      badge.className = "product__badge";
      badge.textContent = entry === winner ? "Goes in the cart" : "Not chosen";

      card.appendChild(name);
      card.appendChild(facts);
      card.appendChild(badge);
      box.appendChild(card);
    });
  }

  toggle.addEventListener("change", render);
  render();
})();

// ---------- Demo 4: one bad image plan (News Buddy) ----------
(function () {
  var ARTICLES = [
    { title: "Article 1", badPlan: false },
    { title: "Article 2", badPlan: false },
    { title: "Article 3", badPlan: true },
    { title: "Article 4", badPlan: false },
    { title: "Article 5", badPlan: false }
  ];

  var beforeButton = document.getElementById("digest-before");
  var afterButton = document.getElementById("digest-after");
  var list = document.getElementById("digest-list");
  var log = document.getElementById("digest-log");

  function render(fixed) {
    beforeButton.setAttribute("aria-pressed", String(!fixed));
    afterButton.setAttribute("aria-pressed", String(fixed));

    list.textContent = "";
    ARTICLES.forEach(function (article) {
      var row = document.createElement("li");
      var title = document.createElement("span");
      var result = document.createElement("span");
      title.textContent = article.title + (article.badPlan ? " (image label too long)" : "");

      if (!fixed) {
        title.className = article.badPlan ? "is-bad" : "is-off";
        result.textContent = "not published";
        result.className = article.badPlan ? "is-bad" : "";
      } else if (article.badPlan) {
        result.textContent = "published, no image";
        result.className = "is-bad";
      } else {
        result.textContent = "published with image";
      }

      row.appendChild(title);
      row.appendChild(result);
      list.appendChild(row);
    });

    log.textContent = fixed
      ? "5 of 5 articles published. 1 went out without an image."
      : "Digest cancelled. 0 of 5 articles published because of one image plan.";
  }

  beforeButton.addEventListener("click", function () { render(false); });
  afterButton.addEventListener("click", function () { render(true); });
  render(false);
})();
