import React from "react";

function DirectoryToolbar({
  searchTerm,
  onSearchChange,
  activeFilter,
  onFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  sortBy,
  onSortChange,
  onExportContacts,
  onImportContacts,
  feedbackMessage,
  filterOptions,
  sortOptions,
  contactCategories,
  totalContacts,
  visibleContacts,
}) {
  const handleImportChange = (event) => {
    const importFile = event.target.files?.[0];

    if (importFile) {
      onImportContacts(importFile);
    }

    event.target.value = "";
  };

  return (
    <section className="directory-toolbar">
      <div className="toolbar-grid">
        <label className="search-field" htmlFor="searchContacts">
          <span>Search contacts</span>
          <input
            id="searchContacts"
            type="search"
            placeholder="Search by name, phone number, email, category, or note"
            value={searchTerm}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </label>

        <div className="toolbar-selects">
          <label className="field small-field" htmlFor="filterCategory">
            <span>Filter category</span>
            <select
              id="filterCategory"
              value={categoryFilter}
              onChange={(event) => onCategoryFilterChange(event.target.value)}
            >
              <option value="all">All categories</option>
              {contactCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>

          <label className="field small-field" htmlFor="sortContacts">
            <span>Sort contacts</span>
            <select
              id="sortContacts"
              value={sortBy}
              onChange={(event) => onSortChange(event.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>
      </div>

      <div className="toolbar-bottom">
        <div className="segmented-control" aria-label="Contact filters">
          {filterOptions.map((option) => (
            <button
              key={option.value}
              className={`segmented-button${
                activeFilter === option.value ? " is-active" : ""
              }`}
              type="button"
              onClick={() => onFilterChange(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>

        <div className="toolbar-actions">
          <p className="toolbar-note">
            Showing {visibleContacts} of {totalContacts} contact
            {totalContacts === 1 ? "" : "s"}
          </p>

          <button
            className="secondary-button"
            type="button"
            onClick={onExportContacts}
          >
            Export backup
          </button>

          <label className="secondary-button file-button" htmlFor="importContacts">
            Import backup
          </label>

          <input
            id="importContacts"
            className="visually-hidden"
            type="file"
            accept="application/json"
            onChange={handleImportChange}
          />
        </div>
      </div>

      {feedbackMessage ? (
        <p className="toolbar-feedback" role="status">
          {feedbackMessage}
        </p>
      ) : null}
    </section>
  );
}

export default DirectoryToolbar;
