document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const constants = App.constants;

  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");
  const registerDistrict = document.getElementById("registerDistrict");
  const registerWard = document.getElementById("registerWard");
  const registerCitizenType = document.getElementById("registerCitizenType");
  const loginRole = document.getElementById("loginRole");
  const loginDemoCredentialCard = document.getElementById("loginDemoCredentialCard");
  const authRoleBanner = document.getElementById("authRoleBanner");

  const loginPresets = {
    general: {
      email: "general@navdristi.in",
      password: "NavDristi@123",
      label: "General user"
    },
    women: {
      email: "women@navdristi.in",
      password: "NavDristi@123",
      label: "Women user"
    },
    men: {
      email: "male@navdristi.in",
      password: "NavDristi@123",
      label: "Male user"
    },
    elder: {
      email: "elder@navdristi.in",
      password: "NavDristi@123",
      label: "Elder user"
    },
    admin: {
      email: "admin@navdristi.in",
      password: "NavDristi@123",
      label: "Admin"
    }
  };

  function renderRoleBanner() {
    const role = loginRole.value;
    if (role === "admin") {
      loginDemoCredentialCard.innerHTML = [
        "<strong>Selected demo user</strong>",
        "<p>Admin / admin@navdristi.in / NavDristi@123</p>"
      ].join("");
      authRoleBanner.innerHTML = [
        "<strong>Admin Login</strong>",
        "<p>Admin access opens the command center, action dashboard, escalation queue, and district analytics.</p>"
      ].join("");
      return;
    }

    syncRolePreset();

    authRoleBanner.innerHTML = [
      "<strong>User Login</strong>",
      "<p>Citizen access opens complaint filing, women support desk, complaint tracking, and service facilities.</p>"
    ].join("");
  }

  function syncRolePreset() {
    const preset = loginPresets[loginRole.value] || loginPresets.general;
    loginDemoCredentialCard.innerHTML = [
      "<strong>Selected demo user</strong>",
      "<p>" + preset.label + " / " + preset.email + " / " + preset.password + "</p>"
    ].join("");
    document.getElementById("loginEmail").value = preset.email;
    document.getElementById("loginPassword").value = preset.password;
  }

  function switchView(view) {
    document.querySelectorAll("[data-auth-view]").forEach(function (button) {
      button.classList.toggle("is-active", button.getAttribute("data-auth-view") === view);
    });
    loginForm.classList.toggle("hidden", view !== "login");
    registerForm.classList.toggle("hidden", view !== "register");
  }

  function redirectUser(role) {
    const user = App.getCurrentUser();
    if (role === "admin") {
      window.location.href = "./admin-dashboard.html";
      return;
    }
    if (user && user.citizenType === "elder") {
      window.location.href = "./elder-support.html";
      return;
    }
    if (user && user.citizenType === "women") {
      window.location.href = "./women-support.html";
      return;
    }
    if (user && user.citizenType === "men") {
      window.location.href = "./men-support.html";
      return;
    }
    window.location.href = "./citizen-dashboard.html";
  }

  function handleLoginSubmit(event) {
    event.preventDefault();
    const formData = new FormData(loginForm);
    const selectedRole = formData.get("role");
    const result = App.login({
      email: formData.get("email"),
      password: formData.get("password"),
      role: selectedRole === "admin" ? "admin" : "citizen"
    });

    if (!result.ok) {
      UI.showToast("Login failed", result.message, "error");
      return;
    }

    UI.showToast("Welcome back", "Redirecting to your dashboard.", "success");
    setTimeout(function () {
      redirectUser(result.user.role);
    }, 260);
  }

  function handleRegisterSubmit(event) {
    event.preventDefault();
    const formData = new FormData(registerForm);
    const result = App.register({
      name: formData.get("name"),
      citizenType: formData.get("citizenType"),
      district: formData.get("district"),
      ward: formData.get("ward"),
      email: formData.get("email"),
      password: formData.get("password")
    });

    if (!result.ok) {
      UI.showToast("Sign up failed", result.message, "error");
      return;
    }

    UI.showToast("Account created", "Your citizen dashboard is ready.", "success");
    setTimeout(function () {
      redirectUser("citizen");
    }, 260);
  }

  function quickLogin(role) {
    const result = App.useDemoAccount(role);
    if (!result.ok) {
      UI.showToast("Demo login failed", result.message, "error");
      return;
    }
    UI.showToast("Demo ready", "Signed in as " + (role === "admin" ? "authority admin." : "citizen user."), "success");
    setTimeout(function () {
      redirectUser(role);
    }, 260);
  }

  UI.mountHeader("auth");
  UI.populateSelect(registerDistrict, constants.districts, constants.districts[0]);
  UI.populateSelect(registerWard, constants.wards, constants.wards[0]);
  renderRoleBanner();

  document.querySelectorAll("[data-auth-view]").forEach(function (button) {
    button.addEventListener("click", function () {
      switchView(button.getAttribute("data-auth-view"));
    });
  });

  loginForm.addEventListener("submit", handleLoginSubmit);
  registerForm.addEventListener("submit", handleRegisterSubmit);
  loginRole.addEventListener("change", renderRoleBanner);

  document.getElementById("demoCitizenLogin").addEventListener("click", function () {
    quickLogin("citizen");
  });

  document.getElementById("demoAdminLogin").addEventListener("click", function () {
    quickLogin("admin");
  });

  document.getElementById("demoWomenLogin").addEventListener("click", function () {
    quickLogin("women");
  });

  document.getElementById("demoMenLogin").addEventListener("click", function () {
    quickLogin("men");
  });

  document.getElementById("demoElderLogin").addEventListener("click", function () {
    quickLogin("elder");
  });

  document.getElementById("resetDemoDataButton").addEventListener("click", function () {
    App.resetDemoData();
    UI.showToast("Demo reset complete", "All demo IDs and passwords were restored.", "success");
    setTimeout(function () {
      loginRole.value = "general";
      syncRolePreset();
      window.location.reload();
    }, 320);
  });

  document.getElementById("enterCitizenPortal").addEventListener("click", function () {
    switchView("login");
    loginRole.value = "general";
    renderRoleBanner();
  });

  document.getElementById("enterAdminPortal").addEventListener("click", function () {
    switchView("login");
    loginRole.value = "admin";
    renderRoleBanner();
  });

  document.getElementById("openWomenSection").addEventListener("click", function () {
    switchView("login");
    loginRole.value = "women";
    renderRoleBanner();
    UI.showToast("Women section ready", "Login as the women user to open the abuse and harassment support section.", "success");
  });

  document.getElementById("openMenSection").addEventListener("click", function () {
    switchView("login");
    loginRole.value = "men";
    renderRoleBanner();
    UI.showToast("Male section ready", "Login as the male user to open the separate abuse and harassment support section.", "success");
  });

  document.getElementById("openElderSection").addEventListener("click", function () {
    switchView("login");
    loginRole.value = "elder";
    renderRoleBanner();
    UI.showToast("Elder section ready", "Login as the elder user to open the emergency support section.", "success");
  });

  if (registerCitizenType) {
    registerCitizenType.value = "general";
  }
  loginRole.value = "general";
  syncRolePreset();
});
