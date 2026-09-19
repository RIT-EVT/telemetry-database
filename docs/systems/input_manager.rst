InputManagerWrapper.gd
======================

GDScript wrapper node around the C++ ``InputManager`` singleton, providing action state queries, event callback bindings, and input management utilities.

Quick Reference
~~~~~~~~~~~~~~~~~~~~~~

.. list-table::
   :widths: 35 20 45
   :header-rows: 1

   * - Method / Function
     - Return Type
     - Brief Description
   * - `is_pressed(action)`_
     - ``bool``
     - Checks if an action is currently held down.
   * - `is_just_pressed(action)`_
     - ``bool``
     - Checks if an action was pressed on the current frame.
   * - `is_just_released(action)`_
     - ``bool``
     - Checks if an action was released on the current frame.
   * - `on_press(action, callback, allowDuplicate)`_
     - ``void``
     - Binds a callback to fire when an action is pressed.
   * - `on_release(action, callback, allowDuplicate)`_
     - ``void``
     - Binds a callback to fire when an action is released.
   * - `on_mouse_move(callback, allowDuplicate)`_
     - ``void``
     - Binds a callback to fire on mouse movement (>= 1px).
   * - `remove_press(action, callback)`_
     - ``void``
     - Unbinds a registered press callback.
   * - `remove_release(action, callback)`_
     - ``void``
     - Unbinds a registered release callback.
   * - `remove_mouse_move(callback)`_
     - ``void``
     - Unbinds a registered mouse movement callback.
   * - `listen(action, press_callback, release_callback)`_
     - ``void``
     - Binds both press and release callbacks simultaneously.
   * - `unlisten(action, press_callback, release_callback)`_
     - ``void``
     - Unbinds both press and release callbacks simultaneously.
   * - `state_snapshot(actions)`_
     - ``Dictionary``
     - Returns a dictionary snapshot of action states.
   * - `validate_inputInstance()`_
     - ``void``
     - Ensures the internal C++ singleton reference is active.

Callable Signatures
~~~~~~~~~~~~~~~~~~~~~~

.. py:function:: ActionCallback(action: StringName)

   Executed when an input action state changes (pressed or released).

   :param action: Name of the input action that triggered the callback.

.. py:function:: MouseMovedCallback(distance_squared: float, relative_motion: Vector2)

   Executed every frame the mouse moves by 1 pixel or more.

   :param distance_squared: Squared distance the mouse moved since the last frame.
   :param relative_motion: 2D vector representing X and Y pixel displacement.

Usage Examples
~~~~~~~~~~~~~~~~~~~~~~

**1. Binding Action Press & Release Callbacks**

.. code-block:: gdscript

   extends Node


   func _ready() -> void:
       # Bind both press and release callbacks for the "jump" action
       G_InputWrapper.listen(&"jump", _on_jump_pressed, _on_jump_released)

   func _on_jump_pressed(action: StringName) -> void:
       print("Action triggered: ", action)

   func _on_jump_released(action: StringName) -> void:
       print("Action released: ", action)

**2. Tracking Mouse Motion & Taking State Snapshots**

.. code-block:: gdscript

   extends Node

   func _ready() -> void:
       # Register callback for mouse displacement
       G_InputWrapper.on_mouse_move(_on_mouse_moved)

   func _on_mouse_moved(dist_sq: float, motion: Vector2) -> void:
       print("Mouse moved relative: ", motion, " (dist^2: ", dist_sq, ")")

   func _process(_delta: float) -> void:
       # Fetch a snapshot of multiple action states in a single query
       var snapshot: Dictionary = G_InputWrapper.state_snapshot([&"move_left", &"move_right"])
       if snapshot.get("move_left", {}).get("pressed", false):
           print("Moving left...")

Class Definition
~~~~~~~~~~~~~~~~~~~~~~

.. py:class:: InputManagerWrapper

   Extends ``Node``. GDScript interface for interacting with the native C++ ``InputManager`` engine singleton.

State Queries
~~~~~~~~~~~~~~~~~~~~~~

.. _`is_pressed(action)`:

.. py:method:: InputManagerWrapper.is_pressed(action: StringName) -> bool

   Returns ``true`` while the specified action is held down.

   :param action: Name of the input action to query.

.. _`is_just_pressed(action)`:

.. py:method:: InputManagerWrapper.is_just_pressed(action: StringName) -> bool

   Returns ``true`` only on the frame the specified action was first pressed.

   :param action: Name of the input action to query.

.. _`is_just_released(action)`:

.. py:method:: InputManagerWrapper.is_just_released(action: StringName) -> bool

   Returns ``true`` only on the frame the specified action was released.

   :param action: Name of the input action to query.

Callback Registration
~~~~~~~~~~~~~~~~~~~~~~

.. _`on_press(action, callback, allowDuplicate)`:

.. py:method:: InputManagerWrapper.on_press(action: StringName, callback: Callable, allowDuplicate: bool = false) -> void

   Registers a callback to fire every time the specified action is pressed.

   :param action: Name of the target input action.
   :param callback: Callable matching :py:func:`ActionCallback`.
   :param allowDuplicate: If ``false``, prevents registering duplicate callables.

.. _`on_release(action, callback, allowDuplicate)`:

.. py:method:: InputManagerWrapper.on_release(action: StringName, callback: Callable, allowDuplicate: bool = false) -> void

   Registers a callback to fire every time the specified action is released.

   :param action: Name of the target input action.
   :param callback: Callable matching :py:func:`ActionCallback`.
   :param allowDuplicate: If ``false``, prevents registering duplicate callables.

.. _`on_mouse_move(callback, allowDuplicate)`:

.. py:method:: InputManagerWrapper.on_mouse_move(callback: Callable, allowDuplicate: bool = false) -> void

   Registers a callback to fire every time the mouse moves by 1 pixel or more.

   :param callback: Callable matching :py:func:`MouseMovedCallback`.
   :param allowDuplicate: If ``false``, prevents registering duplicate callables.

.. _`remove_press(action, callback)`:

.. py:method:: InputManagerWrapper.remove_press(action: StringName, callback: Callable) -> void

   Removes a previously registered press callback for the given action.

   :param action: Target input action name.
   :param callback: ``Callable`` to unbind.

.. _`remove_release(action, callback)`:

.. py:method:: InputManagerWrapper.remove_release(action: StringName, callback: Callable) -> void

   Removes a previously registered release callback for the given action.

   :param action: Target input action name.
   :param callback: ``Callable`` to unbind.

.. _`remove_mouse_move(callback)`:

.. py:method:: InputManagerWrapper.remove_mouse_move(callback: Callable) -> void

   Removes a previously registered mouse movement callback.

   :param callback: ``Callable`` to unbind.

Convenience Helpers
~~~~~~~~~~~~~~~~~~~~~~

.. _`listen(action, press_callback, release_callback)`:

.. py:method:: InputManagerWrapper.listen(action: StringName, press_callback: Callable, release_callback: Callable) -> void

   Registers both press and release callbacks in a single call. Validates callables prior to registration (skips any invalid/null ``Callable``).

   :param action: Target input action name.
   :param press_callback: Callable matching :py:func:`ActionCallback` to trigger on press.
   :param release_callback: Callable matching :py:func:`ActionCallback` to trigger on release.

.. _`unlisten(action, press_callback, release_callback)`:

.. py:method:: InputManagerWrapper.unlisten(action: StringName, press_callback: Callable, release_callback: Callable) -> void

   Unregisters both press and release callbacks in a single call.

   :param action: Target input action name.
   :param press_callback: ``Callable`` to unbind from press events.
   :param release_callback: ``Callable`` to unbind from release events.

.. _`state_snapshot(actions)`:

.. py:method:: InputManagerWrapper.state_snapshot(actions: Array[StringName]) -> Dictionary

   Generates a dictionary snapshot containing state booleans (``pressed``, ``just_pressed``, ``just_released``) for all provided action names.

   :param actions: Array of action names to evaluate.

Internal Methods
~~~~~~~~~~~~~~~~~~~~~~

.. _`validate_inputInstance()`:

.. py:method:: InputManagerWrapper.validate_inputInstance() -> void

   Verifies whether the internal C++ singleton reference (``_inputInstance``) is non-null, attempting to re-fetch it via ``Engine.get_singleton("InputManager")`` if uninitialized.