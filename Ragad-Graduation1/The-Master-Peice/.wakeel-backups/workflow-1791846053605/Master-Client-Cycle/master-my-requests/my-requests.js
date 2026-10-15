const searchInput = document.getElementById("requestSearch");
    const statusFilter = document.getElementById("statusFilter");
    const categoryFilter = document.getElementById("categoryFilter");
    const tabs = document.querySelectorAll(".tab");
    const getRows = () => [...document.querySelectorAll("#requestsBody tr")];
    const resultCount = document.getElementById("resultCount");
    const tableSummary = document.getElementById("tableSummary");
    const emptyState = document.getElementById("emptyState");

    function filterRequests() {
      const query = searchInput.value.trim().toLowerCase();
      const status = statusFilter.value;
      const category = categoryFilter.value;

      let visible = 0;

      const rows = getRows();
      rows.forEach(row => {
        const matchesSearch = row.textContent.toLowerCase().includes(query);
        const matchesStatus = status === "all" || row.dataset.status === status;
        const matchesCategory = category === "all" || row.dataset.category === category;

        const show = matchesSearch && matchesStatus && matchesCategory;

        row.hidden = !show;
        if (show) visible++;
      });

      resultCount.textContent = `${visible} معاملات`;
      tableSummary.textContent = `عرض ${visible} من أصل ${rows.length} معاملات`;
      emptyState.hidden = visible !== 0;

      tabs.forEach(tab => {
        const active = tab.dataset.status === status;
        tab.classList.toggle("active", active);
        tab.setAttribute("aria-pressed", String(active));
      });
    }

    function resetFilters() {
      searchInput.value = "";
      statusFilter.value = "all";
      categoryFilter.value = "all";
      filterRequests();
    }

    searchInput.addEventListener("input", filterRequests);
    statusFilter.addEventListener("change", filterRequests);
    categoryFilter.addEventListener("change", filterRequests);

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        statusFilter.value = tab.dataset.status;
        filterRequests();
      });
    });

    document.getElementById("resetFilters")
      .addEventListener("click", resetFilters);

    document.getElementById("clearEmptyFilters")
      .addEventListener("click", resetFilters);

    filterRequests();