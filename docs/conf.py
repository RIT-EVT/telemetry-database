# Configuration file for the Sphinx documentation builder.
#
# For the full list of built-in configuration values, see the documentation:
# https://www.sphinx-doc.org/en/master/usage/configuration.html

# -- Project information -----------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#project-information

project = "ImagineRIT-WBC"
copyright = "2026, Evan Hughes"
author = "Evan Hughes"
release = "1.0.1"

# -- General configuration ---------------------------------------------------
# https://www.sphinx-doc.org/en/master/usage/configuration.html#general-configuration

needs_sphinx = "8.1"
rst_prolog = """
.. include:: /globals.rst
"""
# Sphinx extension module names and templates location
extensions = [
    "sphinx_tabs.tabs",
    "notfound.extension",
    "sphinxext.opengraph",
    "sphinx_copybutton",
    "sphinxcontrib.video",
    'sphinx_substitution_extensions',
    'sphinx_rtd_theme',
    'sphinx_rtd_dark_mode'
]

# Warning when the Sphinx Tabs extension is used with unknown
# builders (like the dummy builder) - as it doesn't cause errors,
# we can ignore this so we still can treat other warnings as errors.
sphinx_tabs_nowarn = True

# Disable collapsing tabs for codeblocks.
sphinx_tabs_disable_tab_closing = True

templates_path = ["_templates"]
exclude_patterns = []

html_theme = 'sphinx_rtd_theme'
pygments_style = 'monokai'

html_theme_options = {
    'collapse_navigation': False,  # Shows '+' / '-' expand buttons without auto-closing other sections
    'navigation_depth': 4,         # Controls how many sub-levels deep the collapsible tree can render
    'titles_only': True,
}

html_static_path = ['_static']

def setup(app):
    app.add_css_file('custom.css')
    app.add_js_file('custom.js')