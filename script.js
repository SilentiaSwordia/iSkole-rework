import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Funksjon for å sjekke om systemet bruker mørkt eller lyst tema
const detectSystemTheme = () => {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

// Lytt etter endringer i systemtemaet (f.eks. hvis brukeren bytter fra lyst til mørkt tema i OS)
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (e) => {
    if (e.matches) {
      console.log("System switched to dark mode");
      // Her kan man legge til kode for å oppdatere applikasjonens tema dynamisk hvis nødvendig
    } else {
      console.log("System switched to light mode");
    }
  });

document.addEventListener("DOMContentLoaded", () => {
  /** 1) Koble til Supabase (BYTT til dine nøkler) */
  const supabase = createClient(
    "https://ahkcefozgmvzqamouwau.supabase.co",
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFoa2NlZm96Z212enFhbW91d2F1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQyNjYyODEsImV4cCI6MjA4OTg0MjI4MX0.ZkZSxJ6F8ewwoQpWbXhC69cXldVG-6Dswvqzl7jHjHc",
  );

  const logoutBtn = document.getElementById("logoutBtn");
  const panel = document.getElementById("authPanel");
  const openBtn = document.getElementById("authOpenBtn");
  const closeBtn = document.getElementById("authCloseBtn");
  const userBadge = document.getElementById("authUserBadge");
  const loggedOut = document.getElementById("authLoggedOut");
  const loggedIn = document.getElementById("authLoggedIn");
  const whoami = document.getElementById("whoami");
  const roleBadge = document.getElementById("roleBadge");
  const tabButtons = document.querySelectorAll("[data-tab]");
  const loginForm = document.getElementById("loginForm");
  const signupForm = document.getElementById("signupForm");
  const loginMsg = document.getElementById("loginMsg");
  const signupMsg = document.getElementById("signupMsg");
  const showLoginBtn = document.getElementById("showLogin");
  const showSignupBtn = document.getElementById("showSignup");

  const hasAuthUi = loggedOut && loggedIn && whoami && roleBadge && userBadge;

  // openBtn.addEventListener("click", () => panel.classList.add("open"));
  // closeBtn.addEventListener("click", () => panel.classList.remove("open"));

  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      tabButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      const tab = btn.dataset.tab;
      loginForm.style.display = tab === "login" ? "" : "none";
      signupForm.style.display = tab === "signup" ? "" : "none";
    });
  });

  async function refreshAuthUI() {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!hasAuthUi) return;

    if (!user) {
      loggedOut.style.display = "";
      loggedIn.style.display = "none";
      userBadge.textContent = "";
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    const role = profile?.role ?? "user";
    loggedOut.style.display = "none";
    loggedIn.style.display = "";
    whoami.textContent = `${user.email}`;
    roleBadge.textContent = `Rolle: ${role}`;
    userBadge.textContent = role === "admin" ? "Admin" : "Innlogget";
  }
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      loginMsg.textContent = "Logger inn...";
      const email = document.getElementById("loginEmail").value.trim();
      const pass = document.getElementById("loginPass").value;

      try {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password: pass,
        });

        if (error) {
          loginMsg.textContent = "Feil: " + error.message;
        } else if (!error) {
          loginMsg.textContent = "Innlogget ✅";
          window.location.href = "startsiden.html";
        }
      } catch (err) {
        loginMsg.textContent = "En feil oppstod: " + err.message;
        console.error("Login exception:", err);
      }
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      signupMsg.textContent = "Oppretter...";
      const name = document.getElementById("signupName").value.trim();
      const email = document
        .getElementById("signupEmail")
        .value.trim()
        .toLowerCase();
      const pass = document.getElementById("signupPass").value;

      try {
        const res = await supabase.auth.signUp({
          email,
          password: pass,
          options: { data: { display_name: name } },
        });
        console.log("supabase.signUp result:", res);
        if (res.error) {
          signupMsg.textContent = "Feil: " + res.error.message;
        } else {
          signupMsg.textcontent =
            "Konto opprettet ✅ Sjekk e-posten din for bekreftelse!.";
        }
      } catch (err) {
        signupMsg.textContent = `"En feil oppstod: ${err?.message || err}"`;
        console.error("Signup exception:", err);
      }
    });
  }

  supabase.auth.onAuthStateChange(() => {
    refreshAuthUI();
  });

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      try {
        await supabase.auth.signOut();
        await refreshAuthUI();
        window.location.href = "index.html";
      } catch (err) {
        console.error("Logout error:", err);
        alert("Kunne ikke logge ut. Sjekk konsollen.");
      }
    });
  }

  refreshAuthUI();

  function setAuthMode(mode) {
    const isLogin = mode === "login";
    if (loginForm) loginForm.classList.toggle("hidden", !isLogin);
    if (signupForm) signupForm.classList.toggle("hidden", isLogin);
    if (showLoginBtn) showLoginBtn.classList.toggle("active", isLogin);
    if (showSignupBtn) showSignupBtn.classList.toggle("active", !isLogin);
  }

  if (showLoginBtn && showSignupBtn) {
    showLoginBtn.addEventListener("click", () => setAuthMode("login"));
    showSignupBtn.addEventListener("click", () => setAuthMode("signup"));
  }
});

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector(".sidebar");
  const closeBtn = document.querySelector(
    ".fa-times" && ".sidebar-actions .fa-times",
  );
  const menuToggle = document.querySelector(".menu-toggle");

  if (closeBtn && sidebar) {
    closeBtn.addEventListener("click", () => {
      sidebar.classList.toggle("closed");
    });
  }

  if (menuToggle && sidebar) {
    menuToggle.addEventListener("click", () => {
      sidebar.classList.toggle("closed");
    });
  }
});

// Funksjonalitet for sidemenyen (når nettsiden er ferdig lastet)
document.addEventListener("DOMContentLoaded", () => {
  // Finner alle lenker i menyvinduet som har en nedtrekksmeny (dropdown)
  const dropdownToggles = document.querySelectorAll(".has-dropdown > a");

  // Legger til en klikk-hendelse for hver nedtrekksmeny
  dropdownToggles.forEach((toggle) => {
    toggle.addEventListener("click", (e) => {
      e.preventDefault(); // Forhindrer at siden hopper til toppen på grunn av href="#"

      // Finner foreldreelementet (<li>) og bytter på 'dropdown-open' klassen
      // for å vise eller skjule undermenyen
      const parentLi = toggle.parentElement;
      parentLi.classList.toggle("dropdown-open");
    });
  });

  // --- Logikk for Dashboard Widgets (Startsiden) ---
  const grid = document.querySelector(".dashboard-grid");

  // Sjekker om rutenettet (grid) finnes og om Sortable-biblioteket er lastet inn
  if (grid && window.Sortable) {
    // Håndtering av sletting (Event Delegation)
    // Lytter på hele rutenettet istedenfor hver enkelt knapp.
    // Dette gjør at nye kort vi legger til oppdager klikk på "søppelbøtten" automatisk.
    grid.addEventListener("click", (e) => {
      if (e.target.closest(".delete-widget-btn")) {
        const card = e.target.closest(".dashboard-card");
        if (card) {
          card.remove(); // Fjerner kortet fra nettsiden
          saveWidgetConfig(); // Oppdaterer lagringen slik at det forblir slettet neste gang du laster siden
        }
      }
    });

    // Initialiserer SortableJS, som lar oss dra og slippe kort i rutenettet
    new Sortable(grid, {
      handle: ".sortable-handle", // Sier at man må dra oppe i overskriften for å flytte kortet
      animation: 150, // Lager en myk overgang mens andre kort flytter seg unna
      ghostClass: "sortable-ghost", // Klassenavn for stylingen av kortet som blir holdt fast/flyttet
      onEnd: function () {
        // Kalles opp hver gang noen slipper et kort - dette lagrer den nye rekkefølgen
        saveWidgetConfig();
      },
    });

    // Laster inn den lagrede rekkefølgen på dashboardet hvis den finnes
    loadWidgetConfig();

    // Logikk for "Legg til kort"-knappen
    const addCardBtn = document.getElementById("addCardBtn");
    if (addCardBtn) {
      addCardBtn.addEventListener("click", () => {
        // Genererer en unik ID for å holde styr på dette spesifikke nye kortet
        const uniqueId = "custom-widget-" + Date.now();

        // HTML-koden for et tomt, nytt generisk kort
        const cardHTML = `
                    <section class="dashboard-card" data-widget-id="${uniqueId}">
                        <header class="card-header sortable-handle">
                            <h2>Nytt kort</h2>
                            <button class="btn-icon delete-widget-btn"><i class="fa-solid fa-trash"></i></button>
                        </header>
                        <div class="card-body" style="padding: 24px; color: var(--text-secondary);">
                            <p>Dette er et generisk kort. Du kan legge til innhold her.</p>
                        </div>
                    </section>
                `;

        // Legger det nye kortet bakerst i rutenettet
        grid.insertAdjacentHTML("beforeend", cardHTML);
        // Lagrer den nye konfigurasjonen umiddelbart
        saveWidgetConfig();
      });
    }
  }

  // --- Logikk for Profile Dropdown (Top Navigation) ---
  const userProfile = document.querySelector(".user-profile");
  if (userProfile) {
    userProfile.addEventListener("click", (e) => {
      // Unngå at klikk inne i selve dropdown-lenkene også lukker den hvis de evt har prevetDefault
      // (men vi vil at lenkene inni skal fungere som normalt, så sjekker at vi ikke klikker på dropdown)
      if (!e.target.closest(".profile-dropdown")) {
        userProfile.classList.toggle("active");
      }
      e.stopPropagation();
    });

    // Lukk dropdown når man klikker hvor som helst utenfor
    document.addEventListener("click", (e) => {
      if (!userProfile.contains(e.target)) {
        userProfile.classList.remove("active");
      }
    });
  }
});

// Funksjon for å lagre rekkefølgen og innoldet av kortene midlertidig (i brukerens nettleser)
function saveWidgetConfig() {
  const grid = document.querySelector(".dashboard-grid");
  if (!grid) return;

  const config = [];

  // Går gjennom alle kortene som for øyeblikket er på skjermen i riktig rekkefølge
  grid.querySelectorAll(".dashboard-card").forEach((card) => {
    const id = card.getAttribute("data-widget-id");
    let html = null;

    // Hvis kortet er et "fremmed" generisk kort, lagrer vi selvsagt innholdet (HTML) også.
    // For standardkortene (timeplan, min oversikt) lagres bare id'en for å spare plass.
    if (id && !id.includes("-default")) {
      html = card.outerHTML;
    }

    config.push({ id, html });
  });

  // Gjør dette om til tekst og lagrer gjemt i nettleseren sin minne 'localStorage'
  localStorage.setItem("dashboard-config", JSON.stringify(config));
}

// Funksjon for å hente den lagrede layouten og bygge opp kortene slik brukeren forlot dem
function loadWidgetConfig() {
  const configStr = localStorage.getItem("dashboard-config");
  if (!configStr) return; // Hvis ingenting var lagret (første bedriftsbesøk), vis standardskjermen

  try {
    const config = JSON.parse(configStr);
    const grid = document.querySelector(".dashboard-grid");

    // Finner og midlertidig fjerner standard-kortene (slik som Timeplan)
    const defaultWidgets = {};
    grid.querySelectorAll('[data-widget-id$="-default"]').forEach((w) => {
      defaultWidgets[w.getAttribute("data-widget-id")] = w;
      w.remove();
    });

    // Fjerner absolutt resten i rute-nettet for å sikre clean slate
    grid.innerHTML = "";

    // Løper gjennom den lagrede lista i rekkefølge og injiserer kortene på nytt
    config.forEach((item) => {
      if (item.id && defaultWidgets[item.id]) {
        // Setter tilbake et standard kort
        grid.appendChild(defaultWidgets[item.id]);
      } else if (item.html) {
        // Setter inn et nytt unikt bruker-opprettet kort
        grid.insertAdjacentHTML("beforeend", item.html);
      }
    });
  } catch (e) {
    // Ignorer og vis en feil hvis no galt skjedde under prosessen
    console.error("Error loading dashboard config:", e);
  }
}
