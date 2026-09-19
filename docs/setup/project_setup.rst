Project Setup Guide
===========================

Prerequisites
-------------

Before you begin, make sure you have the following installed:

* **Git**

* **Godot 4.7** engine


Cloning the Repository
----------------------

Always clone with submodules:

.. code-block:: bash

   git clone --recurse-submodules https://github.com/EvanHughes-dev/ImagineRITWBC.git

If you already cloned without the flag, initialize the submodule manually:

.. code-block:: bash

   git submodule update --init --recursive

Project Structure
-----------------

.. code-block:: text

   ImagineRITWBC/
   ├── godot-cpp/                   # submodule — C++ bindings (do not edit)
   ├── src/                         # your extension source code
   ├── imagine-ritwbc-godot-Godot/  # Godot Project
   │   └── bin/                     # where extension code builds to
   ├── docs/                        # this documentation
   ├── SConstruct                   # build configuration
   └── .gitmodules                  # submodule config (auto-managed by Git)
