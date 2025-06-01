//Phase 2: Bring Awesomeness with Handles

    // Attach Handles to an a1_lineset Group

    // Define Global Helpers
    const A1_HANDLES = []; // Stores current handles

    // Attach Handles to an a1_lineset Group

    function attachHandlesToLineset(group) {
      removeHandles(); // Clear any old handles

      const handleSize = 10;
      const names = ['tl', 'tr', 'bl', 'br', 't', 'b', 'l', 'r'];

      names.forEach(pos => {
        const handle = new fabric.Rect({
          width: handleSize,
          height: handleSize,
          fill: '#ff6600',
          name: `a1_handle_${pos}`,
          originX: 'left',
          originY: 'top',
          selectable: true,
          evented: true,
          hoverCursor: 'pointer',   // ✅ makes it obvious it’s draggable
          hasControls: false,
          hasBorders: false
        });

        // Set locking based on direction
        if (pos === 'l' || pos === 'r') {
          handle.lockMovementX = false;
          handle.lockMovementY = true;
        } else if (pos === 't' || pos === 'b') {
          handle.lockMovementY = false;
          handle.lockMovementX = true;
        } else {
          handle.lockMovementX = false;
          handle.lockMovementY = false;
        }

        handle.a1_parent_group = group;

        A1_HANDLES.push(handle);
        canvas.add(handle);
        handle.bringToFront();
        handle.setCoords();        // ✅ ensures bounding box is correct
        handle.absolutePositioned = true;

      });

      updateHandlePositions(group);
      canvas.renderAll();
    }

    //update handles
    //dynamically recompute positions relative to the group bounding box.
    function updateHandlePositions(group) {
      group.setCoords(); // Force bounding box refresh
      const bbox = group.getBoundingRect(true); // use absolute=true

      const handleSize = 10;
      const padding = 5;

      const positions = [
        { name: 'tl', left: bbox.left - padding, top: bbox.top - padding },
        { name: 'tr', left: bbox.left + bbox.width - handleSize + padding, top: bbox.top - padding },
        { name: 'bl', left: bbox.left - padding, top: bbox.top + bbox.height - handleSize + padding },
        { name: 'br', left: bbox.left + bbox.width - handleSize + padding, top: bbox.top + bbox.height - handleSize + padding },
        { name: 't', left: bbox.left + bbox.width / 2 - handleSize / 2, top: bbox.top - padding },
        { name: 'b', left: bbox.left + bbox.width / 2 - handleSize / 2, top: bbox.top + bbox.height - handleSize + padding },
        { name: 'l', left: bbox.left - padding, top: bbox.top + bbox.height / 2 - handleSize / 2 },
        { name: 'r', left: bbox.left + bbox.width - handleSize + padding, top: bbox.top + bbox.height / 2 - handleSize / 2 }
      ];

      const activeHandle = canvas.getActiveObject();

      positions.forEach(pos => {
        const handle = A1_HANDLES.find(h => h.name === `a1_handle_${pos.name}`);
        if (!handle || handle === activeHandle) return; // 👈 skip if currently being dragged

        handle.set({ left: pos.left, top: pos.top });
        handle.setCoords();

      });

      canvas.renderAll();
    }


    // Remove Existing Handles
    function removeHandles() {
      // const canvas = lumise.stage().canvas;
      A1_HANDLES.forEach(h => canvas.remove(h));
      A1_HANDLES.length = 0;
    }

    canvas.selection = true;
    canvas.selectionFullyContained = false;
    canvas.subTargetCheck = true;

    let a1_drag_origin = null; // { x, groupLeft, groupWidth }
    let a1_vertical_drag_origin = null; // { y, groupTop, groupHeight, lineCount, direction }


    canvas.on('mouse:up', () => {
      a1_drag_origin = null;
      a1_vertical_drag_origin = null;
    });

    canvas.on('mouse:down', function (e) {
      const target = e.target;

      if (target?.name?.startsWith('a1_handle_')) {
        if (target.a1_parent_group) {
          window._a1_active_group = target.a1_parent_group;

          const group = target.a1_parent_group;
          const bbox = group.getBoundingRect(true);

          group.metadata = {
            originalWidth: bbox.width,
            originalHeight: bbox.height
          };

          attachHandlesToLineset(group);

          // 👉 LEFT HANDLE
          if (target.name === 'a1_handle_l') {
            const pointer = canvas.getPointer(e.e);
            a1_drag_origin = {
              x: pointer.x,
              groupLeft: group.left,
              groupWidth: group.width * group.scaleX
            };
          }

          // 👉 TOP/BOTTOM HANDLE
          if (target.name === 'a1_handle_t' || target.name === 'a1_handle_b') {
            const pointer = canvas.getPointer(e.e);
            a1_vertical_drag_origin = {
              y: pointer.y,
              lineCount: parseInt(document.getElementById('a1_edit_num_lines')?.value || '1', 10),
              direction: target.name === 'a1_handle_t' ? 'top' : 'bottom'
            };
          }
        }
      } else if (target?.name === 'a1_lineset') {
        window._a1_active_group = target;

        const bbox = target.getBoundingRect(true);
        target.metadata = {
          ...target.metadata,
          originalWidth: bbox.width,
          originalHeight: bbox.height
        };

        attachHandlesToLineset(target);
      }
    });

    canvas.on('object:moving', function (e) {
      console.log('[Drag]', e.target?.name);

      const obj = e.target;

      // 👇 When the group is moved, update handle positions
      if (obj?.name === 'a1_lineset') {
        updateHandlePositions(obj);
      }

      const handle = e.target;
      const group = window._a1_active_group;

      if (!handle?.name?.startsWith('a1_handle_') || !group) return;


      const bbox = group.getBoundingRect(true);
      const handleName = handle.name;
      const widthInput = document.getElementById('a1_edit_width');
      const linesInput = document.getElementById('a1_edit_num_lines');
      const spacingInput = document.getElementById('a1_edit_spacing');

      // 👉 Right handle (increase width)
      if (handleName === 'a1_handle_r') {
        const newRight = handle.left;
        const newWidth = Math.max(newRight - bbox.left, 10);
        if (widthInput) {
          widthInput.value = newWidth;
          widthInput.dispatchEvent(new Event('input', { bubbles: false }));
        }
      }

      // 👉 Left handle (increase width from left + move group)
      if (handle.name === 'a1_handle_l' && a1_drag_origin) {
        const pointer = canvas.getPointer(e.e);
        const dx = a1_drag_origin.x - pointer.x; // Moving left → dx > 0

        let newWidth = a1_drag_origin.groupWidth + dx;
        newWidth = Math.max(newWidth, 10); // prevent collapse

        // Adjust group left so that right edge stays the same
        const newLeft = a1_drag_origin.groupLeft - dx;

        group.set({
          width: newWidth,
          left: newLeft,
          scaleX: 1 // enforce scaleX=1
        });

        group.setCoords();

        // Trigger your lineset update
        const widthInput = document.getElementById('a1_edit_width');
        if (widthInput) {
          widthInput.value = newWidth;
          widthInput.dispatchEvent(new Event('input', { bubbles: false }));
        }

      }

      if ((handle.name === 'a1_handle_t' || handle.name === 'a1_handle_b') && a1_vertical_drag_origin) {
        console.log('handle detected: ', a1_vertical_drag_origin);
        const pointer = canvas.getPointer(e.e);
        const deltaY = pointer.y - a1_vertical_drag_origin.y;


        // 👇 Move the handle visually
        handle.set({ top: pointer.y });
        group.setCoords();
        canvas.renderAll();

        const spacing = parseFloat(spacingInput?.value) || 20; // fallback to 20 if input is empty/invalid
        let change = Math.round(deltaY / spacing);

        if (a1_vertical_drag_origin.direction === 'top') change = -change;

        let newLineCount = a1_vertical_drag_origin.lineCount + change;
        newLineCount = Math.max(1, newLineCount);
        console.log(newLineCount);

        const linesInput = document.getElementById('a1_edit_num_lines');
        console.log('parseInt.linesInput.value', linesInput.value);

        if (linesInput && parseInt(linesInput.value) !== newLineCount) {
          linesInput.value = newLineCount;
          linesInput.dispatchEvent(new Event('input', { bubbles: false }));
        }
        // updateHandlePositions(group);

      }

    });

    canvas.on('mouse:down', function (e) {
      const target = e.target;

      // Don't remove handles if clicking on a lineset or a handle
      if (
        target?.name === 'a1_lineset' ||
        target?.name?.startsWith('a1_handle_')
      ) {
        return;
      }

      // If clicked elsewhere, remove handles
      removeHandles();
      canvas.renderAll();
    });