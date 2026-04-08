document.addEventListener("DOMContentLoaded", function () {
  const UI = window.CivicPulseUI;
  const App = window.CivicPulse;
  const departmentFilter = document.getElementById("officerDepartmentFilter");
  const searchInput = document.getElementById("officerSearch");

  function flattenDirectory(directory) {
    return Object.keys(directory).reduce(function (all, department) {
      return all.concat((directory[department] || []).map(function (officer) {
        return {
          department: department,
          name: officer.name || officer,
          role: officer.role || "Officer",
          district: officer.district || "Chhattisgarh",
          phone: officer.phone || "Not listed",
          email: officer.email || "Not listed"
        };
      }));
    }, []);
  }

  function render() {
    UI.mountHeader("officers");
    const directory = App.getOfficerDirectory();
    const officers = flattenDirectory(directory).filter(function (officer) {
      const matchesDepartment = !departmentFilter.value || departmentFilter.value === "all" || officer.department === departmentFilter.value;
      const query = (searchInput.value || "").trim().toLowerCase();
      const haystack = [officer.name, officer.department, officer.role, officer.district, officer.phone, officer.email].join(" ").toLowerCase();
      return matchesDepartment && (!query || haystack.indexOf(query) !== -1);
    });

    document.getElementById("officerDirectoryGrid").innerHTML = officers.map(function (officer) {
      return [
        '<article class="glass-card officer-card">',
        '  <div class="section-title compact">',
        '    <p class="eyebrow">' + UI.escapeHtml(officer.department) + "</p>",
        '    <h2>' + UI.escapeHtml(officer.name) + "</h2>",
        "  </div>",
        '  <div class="stack-list compact-list">',
        '    <article class="stack-item compact-item"><h3>Role</h3><p>' + UI.escapeHtml(officer.role) + "</p></article>",
        '    <article class="stack-item compact-item"><h3>District</h3><p>' + UI.escapeHtml(officer.district) + "</p></article>",
        '    <article class="stack-item compact-item"><h3>Phone</h3><p>' + UI.escapeHtml(officer.phone) + "</p></article>",
        '    <article class="stack-item compact-item"><h3>Email</h3><p>' + UI.escapeHtml(officer.email) + "</p></article>",
        "  </div>",
        "</article>"
      ].join("");
    }).join("");
  }

  UI.populateSelect(departmentFilter, [{ value: "all", label: "All departments" }].concat(App.constants.departments.map(function (department) {
    return { value: department, label: department };
  })), "all");

  departmentFilter.addEventListener("change", render);
  searchInput.addEventListener("input", render);
  App.subscribe(render);
  render();
});
