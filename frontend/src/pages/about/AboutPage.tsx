import React, { useRef, useEffect, Suspense, forwardRef } from 'react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment } from '@react-three/drei';
import { Group } from 'three';

// Component to load and display the 3D model
const Laterna3DModel = forwardRef<Group>((props, ref) => {
  const { scene } = useGLTF('/Laterna_3D.glb');

  // Clone the scene to avoid issues if the model is used multiple times
  const clonedScene = scene.clone();

  // Removed useFrame as rotation is handled by parent component's useEffect

  return <primitive object={clonedScene} ref={ref} scale={1.7} {...props} />; // Adjust scale as needed
});

const AboutPage = () => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const modelRef = useRef<Group>(null); // Ref for the 3D model component, typed as Group

  useEffect(() => {
    const handleScroll = () => {
      if (scrollAreaRef.current && modelRef.current) {
        // Find the scrollable element within ScrollArea
        const scrollAreaElement = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if (scrollAreaElement) {
          const scrollTop = (scrollAreaElement as HTMLElement).scrollTop;
          // Rotate the model based on the scroll position
          // Adjust the multiplier (0.01) to control the rotation speed relative to scroll
          modelRef.current.rotation.y = scrollTop * 0.008;
        }
      }
    };

    const scrollAreaElement = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');

    if (scrollAreaElement) {
      scrollAreaElement.addEventListener('scroll', handleScroll);
    }

    return () => {
      if (scrollAreaElement) {
        scrollAreaElement.removeEventListener('scroll', handleScroll);
      }
    };
  }, []);


  return (
    <ScrollArea className="h-[calc(100vh-180px)]" ref={scrollAreaRef}>
      <div className="flex flex-col items-center justify-center bg-[#1f0637]" style={{ height: '400px' }}> {/* Added height for visibility */}
        {/* 3D Canvas */}
        <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />
          <Suspense fallback={null}>
            <Laterna3DModel ref={modelRef} /> {/* Pass ref to the model component */}
            <Environment preset="city" /> {/* Add environment lighting */}
          </Suspense>
          {/* <OrbitControls enableZoom={false} enablePan={false} enableRotate={false} /> {/* Optional: Add controls for testing */}
        </Canvas>
      </div>
      <div className="p-8 text-zinc-300">
        <h1 className="text-2xl font-bold mb-4">Λατέρνα</h1>
        <p className="mb-4">Σε μία κοινωνία που τα πάντα αποτελούν εμπόρευμα, από τις πρώτες και βασικές μας ανάγκες μέχρι τις τελευταίες και πιο δευτερεύουσες επιθυμίες μας, κάθε αγαθό είτε υλίκο είτε άυλο έχει την τιμή του, όπως οι ραδιοσυχνότητες, ο ήχος και η μουσική. Έναντια, λοιπόν, σε αύτη την κατάσταση και ενώ η αυτοοργάνωση και η αντι-εμπορευματοποίηση διεκδικούν όλο και περισσότερο χώρο, επιχειρήσαμε να συμβάλλουμε στη διάδοσή τους και στο διαδίκτυο, απαλλοτριώνοντας κάτι ακόμα που μας ανήκει και γίνεται αντικείμενο εκμετάλλευσης, τη μουσική. Έχουμε, επομένως, την ανάγκη να δημιουργήσουμε μια πλατφόρμα, με πρόταγμα το αντιεμπορικό και το αυτοοργανωμένο, η οποία θα διανέμει ελεύθερα τη μουσική χωρίς την άμεση (ποσοστά) ή έμμεση (διαφημίσεις) εκμετάλλευση είτε του ακροατού είτε του δημιουργού.</p>
        <p className="mb-4"> Αρχικά, ως ακροατά, μας λείπει να ακούμε μουσική ανενόχλητα, χωρίς διακοπές για διαφημίσεις, χωρίς δεδομένα κινητής και χωρίς να γεμίζουμε ιούς τις συσκευές μας με downloads. Παράλληλα, χωρίς να “νοικιάζουμε” τραγούδια πληρώνοντας premium σε μεγαλοεταιρίες που συνεχίζουν να πλουτίζουν καπηλευόμενες αφενός ξένες δημιουργίες και αφετέρου την ανάγκη μας για μουσική. Δε θέλουμε να μας αναγκάζουν – έστω και καταλάθος – να ακούμε είτε κομμάτια με κακοποιητικό λόγο είτε άτομα με ανάλογες συμπεριφορές απλώς επειδή πατήσαμε “τυχαία αναπαραγωγή“.</p>
        <p className="mb-4"> Από την άλλη, ως δημιουργά έχουμε την ανάγκη να διανέμουμε τη μουσική μας δωρεάν σε όλα, δίνοντας ακόμη το ελεύθερο για επανεπεξεργασία και αναδημοσίευση. Δε θέλουμε να πλουτίζει κανείς από τις δικές μας δημιουργίες. Δε θέλουμε κανένας αριθμός, κανένα “like” και κανένα “share” να καθορίζουν την επιτυχία της μουσικής μας.</p>
        <p className="mb-4">Για όλους αυτούς τους λόγους δημιουργούμε τη “ΛΑΤΕΡΝΑ”. Μία πλατφόρμα όπου θα μπορούν δημιουργά να ανεβάζουν μουσικές κι ακροατά να ακούν ανενόχταμπλ, με ή χωρίς σύνδεση στο διαδίκτυο. </p>
        <p className="mb-4">Όσο η μουσική εμπορευματοποιείται, τόσο θα ανοίγουμε τα παράθυρα μας να ακούμε τη λατέρνα!</p>
        <p className="mb-4">Η πλατφόρμα είναι ανοιχτή να στείλεις τις δικές σου δημιουργίες, επικοινωνώντας με mail στο: <u><a href="mailto:radio@1431am.org">radio@1431am.org</a></u> με θέμα “λατέρνα”.</p>
        <p className="mb-4">Αντι-ιεραρχικά, χωρίς σεξιστικό και κακοποιητικό περιεχόμενο, πάντα αντιεξουσιαστικά ε;;;</p>
        <p>Εγχείρημα του ραδιοφώνου <u><a href="https://www.1431am.org/">1431AM</a></u> που υλοποιήθηκε από το <u><a href="https://gizmolab.net/">gizmo_lab</a></u></p>
      </div>
    </ScrollArea>
  );
};

export default AboutPage;
