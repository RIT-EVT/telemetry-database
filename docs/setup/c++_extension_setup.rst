GDExtension C++ Setup Guide
=============================

Prerequisites
---------------

Before you begin, make sure you have the following installed:

* **Project Pulled** - see :doc:`Project Setup <project_setup>`
* **SCons** — the build system used by godot-cpp (``pip install scons``)
* A **C++ compiler**:

* **Windows:** MSVC (via Visual Studio) or MinGW


Setup Script
----------------------
Setting up the C++ extension is a long and boring process, with a few places where things can go wrong. Luckily, we have a setup script for it!

To run them, navigate to the ``ImagineRITWBC`` directory. If either of these fail, please contact |LEAD_DEV| for assistance.

Windows - **RUN IN POWERSHELL**
~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   ./SetupCpp.ps1

Bash/Linux
~~~~~~~~~~~~~~~~~~~~
.. code-block:: bash

   ./SetupCpp.sh

Next Steps
~~~~~~~~~~~~~~~~~~~~~

If the setup script worked, you are officially ready to start coding in C++ for Godot!

See the :doc:`First C++ File </cpp/basics>` section for the next steps.

If the setup scripts did not work, either installing missing decencies, contact |LEAD_DEV|, or follow the steps below.

Manual Setup
-------------------------

You must compile ``godot-cpp`` once before building your own extension code.

Step 1 — Navigate into the submodule
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   cd godot-cpp

Step 2 — Compile
~~~~~~~~~~~~~~~~

Default (targets latest stable Godot):

.. code-block:: bash
   :substitutions:

   scons api_version=|API_VERSION|

Platform-specific examples:

.. list-table::
   :widths: 30 70
   :header-rows: 1

   * - Platform
     - Command
   * - Windows (64-bit)
     - ``scons platform=windows arch=x86_64``
   * - macOS
     - ``scons platform=macos``
   * - Linux
     - ``scons platform=linux arch=x86_64``

This will produce static libraries in ``godot-cpp/bin/``. This step can take a few minutes.

Step 3 — Return to the project root
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

.. code-block:: bash

   cd ..

Building Your Extension
-----------------------

From the project root, run:

.. code-block:: bash

   scons

The compiled extension will be placed in ``demo/bin/<platform>/``.

Updating the Submodule
----------------------

If the project's ``godot-cpp`` pointer has been updated by a maintainer, sync your local copy:

.. code-block:: bash

   git submodule update --remote --recursive

Then recompile the bindings:

.. code-block:: bash

   cd godot-cpp
   scons
   cd ..

What NOT to Commit
------------------

The following should be in ``.gitignore`` and never pushed:

* ``godot-cpp/bin/``
* ``demo/bin/``
* ``*.os``
* ``*.o``
* ``*.a`` / ``*.lib``
* ``*.so`` / ``*.dll`` / ``*.dylib``

You should commit:

* ``.gitmodules``
* ``SConstruct``
* All files under ``src/``
* The ``.gdextension`` file in ``demo/bin/``

Troubleshooting
---------------

``fatal: 'godot-cpp' already exists in the index``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

The submodule was partially added before. Clean it up and re-add:

.. code-block:: bash
   :substitutions:

   git rm -r --cached godot-cpp
   rm -rf godot-cpp
   rm -rf .git/modules/godot-cpp
   git submodule add -b master https://github.com/godotengine/godot-cpp.git
   git submodule update --init --recursive

``fatal: 'origin/``\ |API_VERSION|\ ``' is not a commit``
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

There is no |API_VERSION| branch — ``godot-cpp`` is now versioned independently. Use the ``master`` branch and pass ``api_version`` to SCons:

.. code-block:: bash
   :substitutions:

   git submodule add -b master https://github.com/godotengine/godot-cpp.git
   scons api_version=|API_VERSION|

SCons can't find the compiler
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

Make sure your compiler is on your system PATH. On Windows, run build commands from the Visual Studio Developer Command Prompt.

Godot doesn't load the extension
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

* Confirm the ``.gdextension`` file paths match your actual output filenames.
* Make sure you compiled for the correct platform and architecture.
* Check that the ``godot-cpp`` ``api_version`` matches your Godot editor version.

Quick Reference
---------------

.. code-block:: bash
   :substitutions:

   # First-time clone
   git clone --recurse-submodules https://github.com/EvanHughes-dev/ImagineRITWBC.git
   OR
   # Update submodule after a maintainer bump
   git submodule update --remote --recursive

   # Compile bindings (one-time, or after submodule update)
   cd godot-cpp
   scons api_version=|API_VERSION|
   cd ..

   # Build extension
   scons

  