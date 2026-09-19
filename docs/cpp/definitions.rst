
Definitions.h
=============================

This header defines fundamental data types, Godot C++ binding aliases, memory management macros, and helper functors/functions for working with Godot string and array types.


Quick Reference
~~~~~~~~~~~~~~~~~~~~~~

.. list-table::
   :widths: 25 20 55
   :header-rows: 1

   * - Symbol
     - Category
     - Brief Description
   * - `uint`_
     - Type Alias
     - Alias for ``unsigned int``
   * - `uint_8`_
     - Type Alias
     - Alias for ``unsigned char``
   * - `StringName`_
     - Godot Alias
     - Alias for ``godot::StringName``
   * - `String`_
     - Godot Alias
     - Alias for ``godot::String``
   * - `Callable`_
     - Godot Alias
     - Alias for ``godot::Callable``
   * - `GDArray<T>`_
     - Godot Alias
     - Template alias for ``godot::TypedArray<T>``
   * - `RefCounted`_
     - Macro
     - Expands to ``godot::RefCounted``
   * - `bind_method`_
     - Macro
     - Expands to ``godot::ClassDB::bind_method``
   * - `D_METHOD`_
     - Macro
     - Expands to ``godot::D_METHOD``
   * - `Object`_
     - Macro
     - Expands to ``godot::Object``
   * - `RefCount`_
     - Macro
     - Expands to ``godot::RefCount``
   * - `Ref`_
     - Macro
     - Expands to ``godot::Ref``
   * - `SafeDelete(p)`_
     - Macro
     - Safely deletes pointer ``p`` and sets to ``nullptr``
   * - `SafeDeleteArray(p)`_
     - Macro
     - Safely deletes array pointer ``p`` and sets to ``nullptr``
   * - `StringNameHash`_
     - Functor
     - Hash functor for ``godot::StringName``
   * - `StringNameEqual`_
     - Functor
     - Equality comparison functor for ``godot::StringName``
   * - `copy`_
     - Function
     - Copies C-style string into a newly allocated buffer

Data Types & Aliases
~~~~~~~~~~~~~~~~~~~~~~

Standard Types
--------------

.. _uint:

.. cpp:type:: uint

   Alias for ``unsigned int``.

.. _uint_8:

.. cpp:type:: uint_8

   Alias for ``unsigned char``.

Godot Type Aliases
------------------

.. _StringName:

.. cpp:type:: StringName

   Alias for ``godot::StringName``.

.. _String:

.. cpp:type:: String

   Alias for ``godot::String``.

.. _Callable:

.. cpp:type:: Callable

   Alias for ``godot::Callable``.

.. _`GDArray<T>`:

.. cpp:type:: template<typename T> GDArray

   Template alias for ``godot::TypedArray<T>``.

Macros
~~~~~~~~~~~~~~~~~~~~~~

Godot Class Definitions
-----------------------

.. _RefCounted:

.. c:macro:: RefCounted

   Expands to ``godot::RefCounted``.

.. _bind_method:

.. c:macro:: bind_method

   Expands to ``godot::ClassDB::bind_method``.

.. _D_METHOD:

.. c:macro:: D_METHOD

   Expands to ``godot::D_METHOD``.

.. _Object:

.. c:macro:: Object

   Expands to ``godot::Object``.

.. _RefCount:

.. c:macro:: RefCount

   Expands to ``godot::RefCount``.

.. _Ref:

.. c:macro:: Ref

   Expands to ``godot::Ref``.

Memory Management
-----------------

.. _`SafeDelete(p)`:

.. c:macro:: SafeDelete(p)

   Deletes pointer ``p`` if non-null and assigns it to ``nullptr``.

.. _`SafeDeleteArray(p)`:

.. c:macro:: SafeDeleteArray(p)

   Deletes array pointer ``p`` using ``delete[]`` if non-null and assigns it to ``nullptr``.

Structures & Functors
~~~~~~~~~~~~~~~~~~~~~~

.. _StringNameHash:

.. cpp:struct:: StringNameHash

   Hash functor for enabling ``godot::StringName`` usage in standard hash-based containers (e.g., ``std::unordered_map``).

   .. cpp:function:: size_t operator()(const StringName& name) const

      Calls ``name.hash()`` to generate a hash value.

.. _StringNameEqual:

.. cpp:struct:: StringNameEqual

   Equality comparison functor for ``godot::StringName``.

   .. cpp:function:: bool operator()(const StringName& a, const StringName& b) const

      Evaluates whether ``a == b``.

Functions
~~~~~~~~~~

.. _copy:

.. cpp:function:: inline void copy(const char a[], char*& b, uint* len)

   Copies a null-terminated C-style string into a newly dynamically allocated buffer.

   :param a: Source null-terminated string array.
   :param b: Output reference pointer where allocated buffer memory is stored.
   :param len: Output pointer set to the string length (excluding the null terminator).