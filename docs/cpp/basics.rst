Writing Your First C++ GDExtension
==================================

With Godot and SCons set up, you can write your first C++ class to extend Godot. This guide covers building a minimal ``Node`` class that prints a message to the Godot console every frame.


Creating the Header File
------------------------

Create a file named ``my_node.h`` inside your C++ source directory (``src/``):

.. code-block:: cpp

   #ifndef MY_NODE_H
   #define MY_NODE_H

   #include <godot_cpp/classes/node.hpp>


   class MyNode : public godot::Node {
       GDCLASS(MyNode, godot::Node)

   protected:
       static void _bind_methods();

   public:
       MyNode();
       ~MyNode();

       void _process(double delta) override;
   };

   #endif // MY_NODE_H


Creating the Source File
------------------------

Create a file named ``my_node.cpp`` in the same directory:

.. code-block:: cpp

   #include "my_node.h"
   #include <godot_cpp/variant/utility_functions.hpp>

   void MyNode::_bind_methods() {
       // Expose C++ methods, properties, and signals to GDScript here
       // Describe the name you want called, any values you want to take in, and the function to invoke
   }

   MyNode::MyNode() {
       // Initialize variables here
   }

   MyNode::~MyNode() {
       // Cleanup resources here
   }

   void MyNode::_process(double delta) {
       godot::UtilityFunctions::print("Hello from C++ GDExtension!");
   }



Registering Node
------------------

Now that you have your node, you have to now make Godot aware that it exists. 

Inside the ``src`` directory, open ``register_types.cpp``. This is where you expose C++ object for Godot to use.

.. code-block:: cpp

    #include "register_types.h"
    #include "my_node.h" // include header file



    void initialize_modules(ModuleInitializationLevel p_level)
    {
        if (p_level != MODULE_INITIALIZATION_LEVEL_SCENE)
        {
            return;
        }
        godot::GDREGISTER_CLASS(my_node); // Make godot aware of your object
    }

    void uninitialize_modules(ModuleInitializationLevel p_level)
    {
        if (p_level != MODULE_INITIALIZATION_LEVEL_SCENE)
        {
            return;
        }
    }

    extern "C"
    {
        // Initialization built C++ to Godot.
        GDExtensionBool GDE_EXPORT imagine_ritwbc_library_init(GDExtensionInterfaceGetProcAddress p_get_proc_address, const GDExtensionClassLibraryPtr p_library, GDExtensionInitialization *r_initialization)
        {
            godot::GDExtensionBinding::InitObject init_obj(p_get_proc_address, p_library, r_initialization);

            init_obj.register_initializer(initialize_modules);
            init_obj.register_terminator(uninitialize_modules);
            init_obj.set_minimum_library_initialization_level(MODULE_INITIALIZATION_LEVEL_SCENE);

            return init_obj.init();
        }
    }

Key Concepts
------------

* ``GDCLASS(MyNode, Node)``: A required macro for every custom Godot C++ class. It handles object inheritance and metadata.
* ``_bind_methods()``: The static registration function used to expose C++ functions and variables to GDScript and the Godot inspector.
* ``UtilityFunctions::print(...)``: The C++ wrapper for GDScript's built-in ``print()`` function.
* ``GDREGISTER_CLASS``: Inform Godot of your new class


Building the Code
-----------------

Compile the updated source files into your dynamic library using SCons.

Run the following command from the root director (outide of ``src/``):

.. code-block:: bash
    :substitutions:

    scons target=template_debug api_version=|API_VERSION|

If you have an error saying ``scons: The term 'scons' is not recognized as a name of a cmdlet, function, script file, or executable program.``,
run:

.. code-block:: bash
    :substitutions:

    python -m SCons target=template_debug api_version=|API_VERSION|


Testing New Node
-------------------

Now that we have it built, we have to actually add it to our Godot scene. 

Open up your Godot project, go to ``Create a New Node`` in the hierarchy, search ``MyNode``, and press ``Create``.

Now when you run your Godot instance, you should see the node printing out every frame. 
