# Configuration file for the Sphinx documentation builder.
#
# This file only contains a selection of the most common options. For a full
# list see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Path setup --------------------------------------------------------------

import os
import sys
from datetime import datetime

# Add the path to your Python project's source code if it's not in the same directory as this conf.py file.
sys.path.insert(0, os.path.abspath('..'))

# -- Project information -----------------------------------------------------

project = 'archmap'
author = 'Mohammed Lotfollahi'  # Replace with your name or organization name
copyright = f'{datetime.now():%Y}, ' + author

# -- General configuration ---------------------------------------------------

# Add any Sphinx extension module names here, as strings. They can be
# extensions coming with Sphinx (named 'sphinx.ext.*') or your custom ones.
extensions = [
    'sphinx.ext.autodoc',
    'sphinx.ext.napoleon',
    'sphinx_rtd_theme',  # Use the Read the Docs theme (install it separately)
]

# Sphinx will look for docstrings and comments in both Python modules and
# reStructuredText files.
source_suffix = ['.rst', '.md']

# The master toctree document.
master_doc = 'index'

# -- Options for HTML output -------------------------------------------------

html_theme = 'sphinx_rtd_theme'  # Use the Read the Docs theme

# Theme options are theme-specific and customize the look and feel of the theme.
html_theme_options = {
    'collapse_navigation': False,  # Allow expanding/collapsing navigation
}

# Output file base name for HTML help builder.
htmlhelp_basename = 'archmapDoc'

# -- Options for LaTeX output ------------------------------------------------

latex_elements = {
    'papersize': 'letterpaper',
    'pointsize': '10pt',
    'preamble': '',
}

# -- Options for manual page output ------------------------------------------

man_pages = [
    (master_doc, 'archmap', 'archmap Documentation',
     [author], 1)
]

# -- Options for Texinfo output ----------------------------------------------

texinfo_documents = [
    (master_doc, 'archmap', 'archmap Documentation',
     author, 'archmap', 'Single cell mapping',
     'Miscellaneous'),
]
