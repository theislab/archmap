import React from "react";
import { Tabs, Tab } from "@mui/material";
import { TabGroup } from "components/Tab";

// Tabs component to group different categories for search
const SearchTabs = ({value, onChange}) => {
  return (
    <Tabs value={value} onChange={onChange}>
      <Tab label="Teams" value="teams" />
      <Tab label="Institutions" value="institutions" />
      <Tab label="Users" value="users" />
      <Tab label="Projects" value="projects" />
    </Tabs>
    // <TabGroup value={value} setV />
  );
};

export default SearchTabs;
